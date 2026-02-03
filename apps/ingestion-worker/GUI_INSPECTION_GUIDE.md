# GUI Inspection Guide: RAG Pipeline Quality Review

This guide shows how to manually inspect and validate the RAG pipeline using GUI tools and visual comparison.

## 📋 Table of Contents

1. [Setup Environment](#setup-environment)
2. [Export Data from PostgreSQL](#export-data-from-postgresql)
3. [Inspect JSON Structure](#inspect-json-structure)
4. [Review Markdown Quality](#review-markdown-quality)
5. [Convert Markdown to PDF](#convert-markdown-to-pdf)
6. [Visual Quality Comparison](#visual-quality-comparison)
7. [Test RAG Queries](#test-rag-queries)

---

## 1. Setup Environment

### Create `.env` file

```bash
cd apps/ingestion-worker
cp .env.example .env

# Edit .env with your credentials:
nano .env
```

Required variables:
```bash
DATABASE_URL=postgresql://user:pass@16.52.210.100:5432/chronos
OPENAI_API_KEY=sk-...
```

---

## 2. Export Data from PostgreSQL

### A. Using DBeaver (GUI - Recommended for Beginners)

**Download:** https://dbeaver.io/download/

**Steps:**
1. **Create Connection**
   - Click "New Connection" → PostgreSQL
   - Host: `16.52.210.100`
   - Port: `5432`
   - Database: `chronos`
   - Username/Password: (from your .env)

2. **View Document Data**
   ```sql
   -- See all processed documents
   SELECT id, file_name, created_at,
          LENGTH(markdown_content) as md_length,
          LENGTH(docling_data::text) as json_length
   FROM ingestion.documents_raw
   ORDER BY created_at DESC;
   ```

3. **Export Markdown to File**
   ```sql
   -- Copy this query result to file
   SELECT markdown_content
   FROM ingestion.documents_raw
   WHERE id = 'c2a4e408-eab2-4f7f-a0ab-afb3c920ebc2';
   ```
   - Right-click result → Export Data → Plain Text
   - Save as: `exported_document.md`

4. **Export JSON to File**
   ```sql
   SELECT jsonb_pretty(docling_data)
   FROM ingestion.documents_raw
   WHERE id = 'c2a4e408-eab2-4f7f-a0ab-afb3c920ebc2';
   ```
   - Save as: `exported_document.json`

### B. Using pgAdmin (GUI Alternative)

**Download:** https://www.pgadmin.org/download/

Similar process as DBeaver - connect and run queries.

### C. Using Command Line (psql)

```bash
# Connect to database
psql $DATABASE_URL

# Export markdown to file
\o exported_document.md
SELECT markdown_content
FROM ingestion.documents_raw
WHERE id = 'c2a4e408-eab2-4f7f-a0ab-afb3c920ebc2';
\o

# Export JSON to file
\o exported_document.json
SELECT jsonb_pretty(docling_data)
FROM ingestion.documents_raw
WHERE id = 'c2a4e408-eab2-4f7f-a0ab-afb3c920ebc2';
\o

\q
```

---

## 3. Inspect JSON Structure

### Using VS Code (Best for JSON)

1. Open `exported_document.json` in VS Code
2. Install extension: "Prettify JSON" (optional)
3. Use Outline view (Ctrl+Shift+O) to navigate structure

### What to Look For:

```json
{
  "pages": [
    {
      "page_num": 1,
      "text": "...",
      "tables": [...],  // ← Check if tables detected
      "images": [...],  // ← Check if images found
      "layout": {...}   // ← Document structure
    }
  ]
}
```

**Quality Checks:**
- ✅ All pages present (count matches PDF page count)
- ✅ Tables extracted (if PDF has tables)
- ✅ Text blocks captured
- ❌ Missing pages or content
- ❌ Corrupted JSON structure

### Using Online JSON Viewer

**Option 1: JSON Crack (Visual Tree)**
- Visit: https://jsoncrack.com/editor
- Paste your JSON
- Get visual tree diagram

**Option 2: JSON Hero**
- Visit: https://jsonhero.io/
- Upload `exported_document.json`
- Interactive exploration

---

## 4. Review Markdown Quality

### Using Typora (Recommended - WYSIWYG)

**Download:** https://typora.io/

**Steps:**
1. Open `exported_document.md` in Typora
2. Enable "Source Code Mode" (View → Source Code Mode)
3. Toggle between source/rendered view

**What to Check:**
- ✅ Headers properly formatted (`##`, `###`)
- ✅ Lists and bullets preserved
- ✅ Tables rendered correctly
- ✅ Special characters intact
- ❌ Hallucinated content not in original PDF
- ❌ Missing sections

### Using VS Code (Developer-Friendly)

1. Open `exported_document.md`
2. Press `Ctrl+Shift+V` (Markdown Preview)
3. Split view: source on left, preview on right

### Using Obsidian (Knowledge Base Style)

**Download:** https://obsidian.md/

Good for reviewing markdown in a note-taking context.

---

## 5. Convert Markdown to PDF

### Option A: Pandoc (Command Line)

**Install:**
```bash
# Ubuntu/Debian
sudo apt-get install pandoc texlive-latex-base texlive-latex-extra

# macOS
brew install pandoc basictex
```

**Convert:**
```bash
cd apps/ingestion-worker

pandoc exported_document.md \
  -o reconstructed_document.pdf \
  --pdf-engine=xelatex \
  -V geometry:margin=1in
```

### Option B: Typora (GUI - Easiest)

1. Open `exported_document.md` in Typora
2. File → Export → PDF
3. Save as `reconstructed_document.pdf`

### Option C: Online Converter

- **Dillinger:** https://dillinger.io/ (MD editor + export)
- **StackEdit:** https://stackedit.io/ (similar)
- **Markdown to PDF:** https://www.markdowntopdf.com/

---

## 6. Visual Quality Comparison

### Side-by-Side Comparison

**Setup:**
1. Open **Original PDF** (test-service-list.pdf) in one window
2. Open **Reconstructed PDF** (from markdown) in another window
3. Open **Exported Markdown** in third window

**Compare:**
```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│   Original PDF      │  Reconstructed PDF  │  Markdown Source    │
│  (Ground Truth)     │  (From Pipeline)    │  (Intermediate)     │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ Page 1: Header      │ Page 1: Header      │ ## Header           │
│ "ONTARIO SUPERIOR"  │ "ONTARIO SUPERIOR"  │ ONTARIO SUPERIOR... │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ Table with 3 cols   │ Table with 3 cols?  │ | Col1 | Col2 |...  │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ Footer: "Page 1/10" │ Footer: preserved?  │ Check footer text   │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

### Quality Checklist

| Aspect | Check | Notes |
|--------|-------|-------|
| **Content Completeness** | □ All text extracted | Compare word count |
| **Formatting** | □ Headers preserved | Check hierarchy |
| **Tables** | □ Tables intact | Row/column alignment |
| **Lists** | □ Bullets/numbering | Nesting preserved |
| **Special Chars** | □ Legal symbols (§, ©) | Unicode handling |
| **Page Numbers** | □ Page refs correct | "Page 1 of 10" |
| **Hallucinations** | □ No added content | Nothing invented |
| **Missing Content** | □ No gaps | Full coverage |

---

## 7. Test RAG Queries

### Using Python Script (Automated)

```bash
cd apps/ingestion-worker

# Set environment variables
export DATABASE_URL="postgresql://..."
export OPENAI_API_KEY="sk-..."

# Run quality test
poetry run python test_rag_quality.py
```

### Using quality_assessment.py (Manual)

```bash
# 1. Visual comparison
poetry run python scripts/quality_assessment.py visual \
  --file-id c2a4e408-eab2-4f7f-a0ab-afb3c920ebc2 \
  --output comparison.md

# 2. JSON inspection
poetry run python scripts/quality_assessment.py inspect \
  --file-id c2a4e408-eab2-4f7f-a0ab-afb3c920ebc2

# 3. RAG query test
poetry run python scripts/quality_assessment.py query \
  --file-id c2a4e408-eab2-4f7f-a0ab-afb3c920ebc2 \
  --question "What services are mentioned in this document?"
```

### Using pgAdmin SQL Editor (Interactive)

**Test Semantic Search:**

```sql
-- Get document chunks for manual review
SELECT
    chunk_index,
    LEFT(text_content, 100) as preview,
    LENGTH(text_content) as length,
    metadata_
FROM ingestion.document_chunks
WHERE document_id = 'c2a4e408-eab2-4f7f-a0ab-afb3c920ebc2'
ORDER BY chunk_index;

-- Check embedding dimensions (should be 1536 for text-embedding-3-small)
SELECT
    chunk_index,
    array_length(embedding::float[], 1) as embedding_dim
FROM ingestion.document_chunks
WHERE document_id = 'c2a4e408-eab2-4f7f-a0ab-afb3c920ebc2'
LIMIT 1;
```

---

## 🎯 Quality Assessment Criteria

### ✅ Good Quality Indicators

1. **Markdown matches original PDF** (98%+ content coverage)
2. **JSON structure complete** (all pages, tables, text blocks)
3. **RAG similarity scores** reasonable (>0.2 for relevant chunks)
4. **No hallucinations** (content matches source)
5. **Formatting preserved** (headers, lists, tables)

### ❌ Red Flags

1. **Missing pages or sections**
2. **Corrupted tables** (misaligned columns)
3. **Invented content** (not in original PDF)
4. **Poor similarity scores** (<0.15 for relevant queries)
5. **Encoding errors** (mojibake: ãƒ†ã‚¹ãƒˆ)

---

## 📊 Example Workflow

### Real Example: test-service-list.pdf

**1. Export from database:**
```sql
-- Get document ID (if you don't know it)
SELECT id, file_name, created_at
FROM ingestion.documents_raw
WHERE file_name LIKE '%service-list%'
ORDER BY created_at DESC
LIMIT 1;

-- Result: c2a4e408-eab2-4f7f-a0ab-afb3c920ebc2
```

**2. Export markdown:**
```bash
psql $DATABASE_URL -c "
  SELECT markdown_content
  FROM ingestion.documents_raw
  WHERE id = 'c2a4e408-eab2-4f7f-a0ab-afb3c920ebc2'
" -o test_export.md
```

**3. Convert to PDF:**
```bash
pandoc test_export.md -o test_reconstructed.pdf
```

**4. Compare:**
- Original: `apps/ingestion-worker/test-service-list.pdf`
- Reconstructed: `test_reconstructed.pdf`
- Markdown: `test_export.md`

**5. Review:**
Open all three side-by-side in your PDF viewer and text editor.

---

## 🛠️ Troubleshooting

### Issue: Can't connect to database

```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# If fails, check:
# 1. DATABASE_URL format correct
# 2. Security group allows your IP
# 3. Database is running
```

### Issue: Missing markdown_content

```sql
-- Check if column exists
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'ingestion'
  AND table_name = 'documents_raw'
  AND column_name = 'markdown_content';

-- If missing, run migration:
-- alembic upgrade head
```

### Issue: Pandoc conversion fails

```bash
# Simpler conversion (no LaTeX required)
pandoc exported_document.md -o output.html

# Then open HTML in browser and Print to PDF
```

---

## 📚 Additional Resources

### Tools
- **DBeaver:** https://dbeaver.io/
- **Typora:** https://typora.io/
- **Pandoc:** https://pandoc.org/
- **VS Code:** https://code.visualstudio.com/

### Documentation
- **Docling:** https://github.com/DS4SD/docling
- **pgvector:** https://github.com/pgvector/pgvector
- **LlamaIndex:** https://docs.llamaindex.ai/

### Next Steps
After validating quality:
1. Process more documents (batch processing)
2. Fine-tune chunking parameters (chunk_size, overlap)
3. Experiment with different embedding models
4. Build RAG query UI for end-users
