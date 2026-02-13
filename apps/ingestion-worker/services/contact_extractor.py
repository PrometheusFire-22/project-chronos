"""
CCAA Contact Extractor — uses GPT-4o to extract structured contacts
from Docling-processed markdown of CCAA filings.
"""

import json
import logging
from typing import TypedDict

import openai

logger = logging.getLogger(__name__)


class Contact(TypedDict):
    name: str
    role: str  # Monitor, Counsel, Trustee, Debtor, Secured Creditor, etc.
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
    """Extract contacts from CCAA filing markdown using GPT-4o."""
    logger.info("🔍 Starting NER extraction with GPT-4o...")

    client = openai.AsyncOpenAI()

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Extract all contacts from this CCAA filing:\n\n{markdown_content}",
            },
        ],
        response_format={"type": "json_object"},
        temperature=0.0,
        max_tokens=4096,
    )

    result = json.loads(response.choices[0].message.content)
    contact_count = len(result.get("contacts", []))
    logger.info(f"✅ Extracted {contact_count} contacts")

    return result
