# Phase 1 MVP: CCAA Contact Extractor — Implementation Guide

> **Epic**: CHRONOS-540
> **Branch**: `feature/ccaa-contact-extractor`
> **Status**: Not started — Jira tickets created, implementation docs written
> **Date**: 2026-02-12

---

## Overview

Ship a product where users upload a CCAA filing PDF on the homepage and get back a structured CSV of extracted contacts. Three layers: Python backend (NER extraction), Next.js API route (proxy), Next.js frontend (upload + results table).

---

## Task 1: CHRONOS-541 — NER Prompt + Python Endpoint

### What exists already

The RAG pipeline is 90% complete:
- `apps/ingestion-worker/modal_functions/docling_processor.py` — Modal GPU function, PDF → JSON + Markdown (working, ~27s, ~$0.01/doc)
- `apps/ingestion-worker/services/ingestion_service.py` — orchestrates Docling → chunking → embeddings → pgvector
- `apps/ingestion-worker/main.py` — FastAPI app with webhook endpoints
- `apps/ingestion-worker/models.py` — SQLAlchemy models for `ingestion.documents_raw` and `ingestion.document_chunks`
- Database schema deployed: `ingestion.*` tables with pgvector HNSW index

### What to build

#### A. NER Extraction Service

Create: `apps/ingestion-worker/services/contact_extractor.py`

```python
"""
CCAA Contact Extractor — uses GPT-4 to extract structured contacts
from Docling-processed markdown of CCAA filings.
"""
import json
import openai
from typing import TypedDict

class Contact(TypedDict):
    name: str
    role: str          # Monitor, Counsel, Trustee, Debtor, Secured Creditor, etc.
    firm: str
    email: str | None
    phone: str | None
    address: str | None

class ExtractionResult(TypedDict):
    contacts: list[Contact]
    document_metadata: dict  # case_name, court_file_no, filing_date

SYSTEM_PROMPT = """You are a legal document analyst specializing in Canadian CCAA
(Companies' Creditors Arrangement Act) filings. Extract ALL contact information
from the provided document.

Return a JSON object with this exact structure:
{
  "contacts": [
    {
      "name": "Full Name",
      "role": "Role (Monitor, Counsel to Monitor, Counsel to Debtor, Trustee, Secured Creditor, Applicant, Respondent, etc.)",
      "firm": "Firm or Organization Name",
      "email": "email@example.com or null",
      "phone": "+1-416-555-0100 or null",
      "address": "Full address or null"
    }
  ],
  "document_metadata": {
    "case_name": "Case name from filing",
    "court_file_no": "Court file number",
    "filing_date": "Date of filing or null"
  }
}

Rules:
- Extract EVERY person/entity with contact info, not just the first few
- Include parties listed in the service list, cover page, and body
- If a field is not found, use null (do not guess)
- Normalize phone numbers to +1-XXX-XXX-XXXX format
- For role, use the exact role as stated in the document
- Return ONLY valid JSON, no markdown fencing"""

async def extract_contacts(markdown_content: str) -> ExtractionResult:
    """Extract contacts from CCAA filing markdown using GPT-4."""
    client = openai.AsyncOpenAI()

    response = await client.chat.completions.create(
        model="gpt-4o",          # gpt-4o is cheaper than gpt-4-turbo, still excellent for NER
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Extract all contacts from this CCAA filing:\n\n{markdown_content}"}
        ],
        response_format={"type": "json_object"},
        temperature=0.0,         # deterministic extraction
        max_tokens=4096,
    )

    result = json.loads(response.choices[0].message.content)
    return result
```

#### B. CSV Generation Utility

Create: `apps/ingestion-worker/utils/csv_generator.py`

```python
import csv
import io
from typing import list

def contacts_to_csv(contacts: list[dict]) -> str:
    """Convert contacts list to CSV string."""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["name", "role", "firm", "email", "phone", "address"])
    writer.writeheader()
    for contact in contacts:
        writer.writerow(contact)
    return output.getvalue()
```

#### C. New FastAPI Endpoint

Add to `apps/ingestion-worker/main.py`:

```python
from fastapi import UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from services.contact_extractor import extract_contacts
from utils.csv_generator import contacts_to_csv

@app.post("/api/extract-contacts")
async def extract_contacts_endpoint(
    file: UploadFile = File(...),
    format: str = "json"  # "json" or "csv"
):
    # Validate
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(415, "Only PDF files are supported")

    pdf_bytes = await file.read()
    if len(pdf_bytes) > 50 * 1024 * 1024:  # 50MB
        raise HTTPException(413, "File too large (max 50MB)")

    # Step 1: Docling processing (existing pipeline)
    from modal_functions.docling_processor import process_pdf
    result = process_pdf.remote(pdf_bytes, file.filename)
    markdown_content = result["markdown"]

    # Step 2: NER extraction
    extraction = await extract_contacts(markdown_content)

    # Step 3: Store in database (existing)
    # ... save to ingestion.documents_raw ...

    # Step 4: Return
    if format == "csv":
        csv_content = contacts_to_csv(extraction["contacts"])
        return StreamingResponse(
            io.BytesIO(csv_content.encode()),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={file.filename.replace('.pdf', '_contacts.csv')}"}
        )

    return extraction
```

#### D. Testing

Test with real CCAA filings. You should have sample PDFs from your earlier Docling work. Run:

```bash
cd apps/ingestion-worker
# Start FastAPI locally
uvicorn main:app --reload --port 8000

# Test with curl
curl -X POST http://localhost:8000/api/extract-contacts \
  -F "file=@/path/to/sample_ccaa_filing.pdf" \
  | python -m json.tool
```

---

## Task 2: CHRONOS-542 — Next.js API Route

Create: `apps/web/app/api/documents/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.INGESTION_WORKER_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 415 })
  }

  // TODO: Check auth session + usage limits (CHRONOS-544)

  // Proxy to Python backend
  const backendForm = new FormData()
  backendForm.append('file', file)

  try {
    const response = await fetch(`${BACKEND_URL}/api/extract-contacts`, {
      method: 'POST',
      body: backendForm,
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: 'Processing failed', details: error },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Backend unavailable. Please try again.' },
      { status: 504 }
    )
  }
}

export const config = {
  api: { bodyParser: false },
}
```

Environment variable needed in `.env.local` and Cloudflare Pages:
```
INGESTION_WORKER_URL=http://localhost:8000   # local
INGESTION_WORKER_URL=https://api.chronos.example.com  # production
```

---

## Task 3: CHRONOS-543 — Homepage Redesign

### Components to create

All in `apps/web/components/`:

1. **`upload/FileDropzone.tsx`** — Drag-and-drop PDF upload component
   - Uses `react-dropzone` or native drag events
   - Shows file name + size after selection
   - Validates PDF type client-side
   - Emits `onFileSelected(file: File)` callback

2. **`upload/ProcessingSteps.tsx`** — Animated progress indicator
   - 3 steps: Parsing → Extracting → Building
   - Uses framer-motion (existing pattern in codebase)
   - Each step transitions: pending → active (spinner) → done (checkmark)

3. **`upload/ContactsTable.tsx`** — Inline results table
   - Columns: Name, Role, Firm, Email, Phone
   - Scrollable if >10 rows
   - "Download CSV" primary button
   - "Upload Another" secondary button (resets to upload state)
   - If not authenticated: "Sign up to save extractions" CTA

4. **`sections/UploadHero.tsx`** — Main hero section
   - Left: headline + 2-3 lines copy + optional "How it works" mini-steps
   - Right: state machine — FileDropzone → ProcessingSteps → ContactsTable
   - State managed with `useState<'upload' | 'processing' | 'results'>`

### Homepage page.tsx changes

`apps/web/app/(frontend)/page.tsx`:
- Replace all CMS-driven sections (HeroSection, ProblemStatement, FeaturesPreview, UseCases, WaitlistSection) with `UploadHero`
- Keep Footer
- Add minimal "How it works" section below if needed
- Make it a client component (needs state for upload flow)

### Design tokens to use
- `heading-hero` for headline
- `text-body-lg` for subtitle
- `heading-card` for section titles
- Card: `rounded-2xl bg-card border border-border` for the upload area
- Existing framer-motion patterns for animations

---

## Task 4: CHRONOS-544 — Usage Gating

### Free tier limits
- Unauthenticated: 1 extraction (track by IP in a simple rate limit table or cookie)
- Authenticated free tier: 3 docs/month
- Use existing user columns: `documents_processed`, `queries_this_month`

### Implementation
- Check in Next.js API route (CHRONOS-542) before proxying
- Return 429 with `{ error: "limit_reached", upgrade_url: "/sign-up" }`
- Frontend shows inline upgrade CTA in the results area

### Stripe (minimal)
- Can defer Stripe to after launch — start with free tier + "contact us for more"
- When ready: Stripe Checkout, single plan, webhook to update user tier
- Ontario sole proprietorship works with Stripe (no incorporation needed)

---

## Architecture Diagram

```
Browser
  │
  ├── Homepage (UploadHero component)
  │     ├── FileDropzone → selects PDF
  │     ├── ProcessingSteps → shows progress
  │     └── ContactsTable → shows results + download
  │
  ├── POST /api/documents/upload (Next.js API route)
  │     ├── Auth check (Better Auth session)
  │     ├── Usage limit check
  │     └── Proxy to Python backend
  │
  └── POST /api/extract-contacts (Python FastAPI)
        ├── Modal GPU / Docling → PDF to Markdown
        ├── GPT-4o NER → Markdown to structured contacts JSON
        ├── Store in PostgreSQL (ingestion.documents_raw)
        └── Return contacts JSON (or CSV)
```

---

## Key Files Reference

### Existing (working)
- `apps/ingestion-worker/modal_functions/docling_processor.py` — Modal GPU PDF processing
- `apps/ingestion-worker/services/ingestion_service.py` — pipeline orchestration
- `apps/ingestion-worker/main.py` — FastAPI app
- `apps/ingestion-worker/models.py` — database models
- `apps/ingestion-worker/utils/json_to_markdown.py` — custom Docling renderer
- `apps/web/app/globals.css` — design system tokens

### To create
- `apps/ingestion-worker/services/contact_extractor.py` — GPT-4 NER
- `apps/ingestion-worker/utils/csv_generator.py` — CSV generation
- `apps/web/app/api/documents/upload/route.ts` — Next.js proxy route
- `apps/web/components/upload/FileDropzone.tsx`
- `apps/web/components/upload/ProcessingSteps.tsx`
- `apps/web/components/upload/ContactsTable.tsx`
- `apps/web/components/sections/UploadHero.tsx`

---

## Starting a new session

When picking this up in a new Claude Code session:

1. Read this file first: `docs/10-DEVELOPMENT/06-MVP-PHASE1/IMPLEMENTATION_GUIDE.md`
2. Check Jira Epic CHRONOS-540 for current task status
3. You're on branch `feature/ccaa-contact-extractor`
4. Start with CHRONOS-541 (Python NER endpoint) — it has no dependencies
5. Test with real CCAA PDFs before moving to frontend work
