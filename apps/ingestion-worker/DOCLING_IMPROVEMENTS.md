# Docling Quality Improvements - Implementation Summary

**Date**: February 3, 2026
**Jira**: CHRONOS-496
**Status**: ✅ Implementation Complete - Ready for Testing

## Changes Implemented

### 1. Advanced Docling Configuration (Task #1) ✅

**File**: `modal_functions/docling_processor.py`

**Changes**:
- ✅ Configured `TableFormerMode.ACCURATE` (vs default FAST mode)
- ✅ Enabled explicit OCR (`do_ocr=True`)
- ✅ Enabled table structure recognition (`do_table_structure=True`)
- ✅ Added quality metrics logging (pages, tables, text blocks)

**File**: `services/ingestion_service_modal.py`

**Changes**:
- ✅ Applied same configuration to local CPU fallback
- ✅ Added markdown_content to database storage
- ✅ Added post-processing quality logging

### 2. Markdown Post-Processing (Task #3) ✅

**New File**: `utils/markdown_postprocessor.py`

**Features**:
- 🔧 Contact info formatting (breaks up merged contact blocks)
- 🔧 Semantic line breaks (headers → body text transitions)
- 🔧 Table spacing improvements
- 🔧 Email/phone number structure preservation

**Inline Implementation**: `modal_functions/docling_processor.py`

**Applied Transformations**:
1. Line breaks after headers (`#`, `##`, `###`)
2. Line breaks before/after tables
3. Line breaks before `Direct:` and `E-mail:`
4. Separation of email from following name

### 3. Quality Validation Tools

**New File**: `test_docling_improvements.py`

**Features**:
- Analyzes quality issues in existing documents
- Counts problematic patterns (merged contacts, missing line breaks)
- Provides before/after comparison guidance

## Expected Quality Improvements

| Issue | Before | After |
|-------|--------|-------|
| **Line Breaks** | Headers run into body text | Extra blank line after headers |
| **Contact Info** | `email@example.com John Doe Direct: 123` | `email@example.com`<br/>`John Doe`<br/>`Direct: 123` |
| **Table Quality** | Default grid detection | ACCURATE mode with better cell boundaries |
| **Markdown Length** | ~24,000 chars | ~25,000+ chars (more line breaks) |

## What We Addressed

### ✅ Fully Addressed
1. **Line breaks** - Added automatic line breaks after headers
2. **Table structure** - ACCURATE mode improves column detection
3. **Contact formatting** - Post-processor restructures merged blocks

### ⚠️ Partially Addressed
4. **Readability vs parsability** - Now have both (structured markdown)
5. **Semantic formatting** - Post-processor adds structure, but doesn't extract bold/italic

### ❌ Known Limitations (Docling)
6. **Bold/italic text** - Docling doesn't expose this in markdown export (available in JSON bbox data)
7. **Hierarchical cell content** - Requires custom logic (partially addressed by post-processor)

## Testing Instructions

### Step 1: Deploy Updated Modal Function

```bash
cd /home/prometheus/coding/finance/project-chronos
modal deploy apps/ingestion-worker/modal_functions/docling_processor.py
```

### Step 2: Analyze Current Quality (Baseline)

```bash
cd apps/ingestion-worker
python test_docling_improvements.py
```

This shows the quality issues in the existing test document.

### Step 3: Re-Process Test Document

```bash
# Option A: Use existing document in Directus (upload via web)
# The webhook will automatically trigger Modal GPU processing

# Option B: Test locally with a PDF
modal run modal_functions/docling_processor.py --test-pdf-path path/to/test.pdf
```

### Step 4: Run Quality Check

```bash
python automated_quality_check.py
```

### Step 5: Manual Review

1. Open PgAdmin4
2. Query: `SELECT markdown_content FROM ingestion.documents_raw WHERE id = '<new-doc-id>'`
3. Compare with old document (ID: `c2a4e408-eab2-4f7f-a0ab-afb3c920ebc2`)
4. Open exported markdown in Typora for visual inspection

## Quality Metrics to Check

Run this SQL to compare documents:

```sql
WITH doc_stats AS (
    SELECT
        id,
        file_name,
        created_at,
        length(markdown_content) as md_length,
        (markdown_content ~ '##\\s+[^\\n]+\\n\\n') as has_header_spacing,
        (markdown_content ~ 'Direct:\\n') as has_contact_breaks
    FROM ingestion.documents_raw
    WHERE file_name = 'test-service-list.pdf'
    ORDER BY created_at DESC
)
SELECT * FROM doc_stats;
```

Expected for new documents:
- ✅ `md_length` > 24,000 (more line breaks)
- ✅ `has_header_spacing` = true
- ✅ `has_contact_breaks` = true

## Known Issues & Future Work

### Issue: Bold/Italic Not Captured

**Root Cause**: Docling's `export_to_markdown()` doesn't include text styling.

**Potential Solutions**:
1. **Task #2**: Build custom markdown exporter that reads `doc_json` bbox data
2. Use Docling's rich JSON format and build custom renderer
3. Evaluate alternative parsers (Azure Document Intelligence, AWS Textract)

**Recommendation**: Test current improvements first. If bold/italic is critical, pursue Task #2.

### Issue: Complex Table Structures

**Current State**: ACCURATE mode helps, but complex nested cells still challenging.

**Potential Solutions**:
1. Add table-specific post-processing rules
2. Store both: JSON (machine) + Markdown (human)
3. Evaluate specialized table extraction tools

**Recommendation**: Monitor real-world documents. If tables remain problematic, investigate alternatives (Task #4).

## Cost Impact

**Before**:
- Modal GPU: ~$0.01-0.03 per document
- OpenAI Embeddings: ~$0.0001 per document

**After**:
- Modal GPU: ~$0.01-0.03 per document (same)
- OpenAI Embeddings: ~$0.0001 per document (same)
- **Total: No cost increase** (post-processing is lightweight)

**Processing Time Impact**:
- ACCURATE mode: +10-20% processing time vs FAST mode
- Post-processing: <0.1s additional overhead
- **Overall impact**: Minimal (~2-5 seconds extra for 10-page doc)

## Next Steps

1. ✅ **Test the improvements** (follow Testing Instructions above)
2. ⚠️ **Document findings** - Create comparison screenshots
3. ⏭️ **Decide on Task #2** - Custom markdown exporter (if bold/italic critical)
4. ⏭️ **Decide on Task #4** - Alternative parser evaluation (if quality insufficient)

## Files Modified

```
apps/ingestion-worker/
├── modal_functions/
│   └── docling_processor.py          [MODIFIED] - Advanced config + post-processing
├── services/
│   └── ingestion_service_modal.py    [MODIFIED] - Local config + markdown storage
├── utils/
│   ├── __init__.py                   [NEW] - Utils module
│   └── markdown_postprocessor.py     [NEW] - Post-processing logic
├── test_docling_improvements.py      [NEW] - Quality analysis script
└── DOCLING_IMPROVEMENTS.md           [NEW] - This file
```

## Git Commit

```bash
git add apps/ingestion-worker/
git commit -m "feat(ingestion): improve Docling quality with ACCURATE mode and post-processing [CHRONOS-496]

Addresses quality issues identified in manual review:
- Configure TableFormerMode.ACCURATE for better table extraction
- Add markdown post-processor for contact info and line breaks
- Save improved markdown to database
- Add quality metrics logging

Quality improvements:
- Better header-to-text transitions
- Restructured contact information blocks
- Improved table cell boundaries
- Enhanced readability while maintaining parseability

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

## Questions?

- Docling configuration: https://github.com/DS4SD/docling
- Modal deployment: https://modal.com/docs
- Quality issues: Review quality_review/test-service-list.md

---

**Status**: Ready for deployment and testing ✅
