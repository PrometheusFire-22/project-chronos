#!/usr/bin/env python3
"""
Migration script to add markdown_content column to ingested_documents table.
Run this before testing the updated ingestion service.
"""

import os

from sqlalchemy import create_engine, text

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL environment variable not set")
    print("Set it with: export DATABASE_URL='postgresql://...'")
    exit(1)

print("🔌 Connecting to database...")
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        # Add markdown_content column
        print("📝 Adding markdown_content column...")
        conn.execute(
            text(
                """
            ALTER TABLE ingestion.documents_raw
            ADD COLUMN IF NOT EXISTS markdown_content TEXT;
        """
            )
        )

        # Add comment
        print("💬 Adding column comment...")
        conn.execute(
            text(
                """
            COMMENT ON COLUMN ingestion.documents_raw.markdown_content IS
            'Full markdown representation from Docling. Preserves structure (headers, lists, tables) with emojis and special characters. Used for human-readable debugging, rechunking without reprocessing, and quality assessment.';
        """
            )
        )

        # Add full-text search index
        print("🔍 Creating full-text search index...")
        conn.execute(
            text(
                """
            CREATE INDEX IF NOT EXISTS idx_documents_raw_markdown_fts
            ON ingestion.documents_raw
            USING gin(to_tsvector('english', markdown_content));
        """
            )
        )

        conn.commit()

        print("✅ Migration complete!")
        print("\n📊 Verifying column exists...")

        result = conn.execute(
            text(
                """
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_schema = 'ingestion'
              AND table_name = 'documents_raw'
              AND column_name = 'markdown_content';
        """
            )
        )

        row = result.fetchone()
        if row:
            print(f"✓ Column '{row[0]}' exists (type: {row[1]})")
        else:
            print("⚠️  Column not found - migration may have failed")

except Exception as e:
    print(f"❌ Migration failed: {e}")
    exit(1)

print("\n🎉 Ready to test ingestion pipeline!")
