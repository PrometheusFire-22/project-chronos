#!/usr/bin/env python3
"""Check what tables exist and in which schemas."""

import os

from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # Check for ingested_documents table in all schemas
    result = conn.execute(
        text(
            """
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_name IN ('ingested_documents', 'document_chunks', 'documents_raw')
        ORDER BY table_schema, table_name;
    """
        )
    )

    print("📊 Existing tables:\n")
    for row in result:
        print(f"   {row[0]}.{row[1]}")

    # Check if ingestion schema exists
    result2 = conn.execute(
        text(
            """
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name = 'ingestion';
    """
        )
    )

    if result2.fetchone():
        print("\n✓ Schema 'ingestion' exists")
    else:
        print("\n⚠️ Schema 'ingestion' does NOT exist")
