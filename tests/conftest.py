"""
Project Chronos: Pytest Configuration
======================================
Shared test fixtures and configuration
"""

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from chronos.config.settings import settings


@pytest.fixture(scope="session")
def test_engine():
    """Create test database engine."""
    engine = create_engine(settings.database_url)
    yield engine
    engine.dispose()


@pytest.fixture(scope="function")
def test_session(test_engine):
    """Create isolated test database session."""
    Session = sessionmaker(bind=test_engine)
    session = Session()

    yield session

    session.rollback()
    session.close()


@pytest.fixture(scope="session")
def seed_test_database(test_engine):
    """Seed database with minimal test data if empty."""

    with test_engine.connect() as conn:
        # Clear existing data to ensure clean state with correct schema
        conn.execute(
            text(
                "TRUNCATE TABLE timeseries.economic_observations, metadata.series_metadata, metadata.data_sources CASCADE"
            )
        )
        conn.commit()

        # Insert Data Sources
        conn.execute(
            text(
                """
                INSERT INTO metadata.data_sources (source_name, source_description)
                VALUES
                    ('FRED', 'Federal Reserve Economic Data'),
                    ('BOC', 'Bank of Canada')
                ON CONFLICT (source_name) DO NOTHING;
                """
            )
        )
        conn.commit()

        # Insert Series Metadata
        conn.execute(
            text(
                """
                INSERT INTO metadata.series_metadata
                (source_series_id, source_id, series_name, frequency, units, seasonal_adjustment, last_updated, series_type)
                VALUES
                    ('DEXUSEU', (SELECT source_id FROM metadata.data_sources WHERE source_name = 'FRED'), 'US / Euro FX Rate', 'D', 'USD/EUR', 'NSA', NOW(), 'FX'),
                    ('FXEURCAD', (SELECT source_id FROM metadata.data_sources WHERE source_name = 'BOC'), 'Euro / CAD FX Rate', 'D', 'EUR/CAD', 'NSA', NOW(), 'FX'),
                    ('GDP', (SELECT source_id FROM metadata.data_sources WHERE source_name = 'FRED'), 'Gross Domestic Product', 'Q', 'Billions of Dollars', 'SA', NOW(), 'MACRO')
                ON CONFLICT (source_series_id, source_id) DO NOTHING;
                """
            )
        )
        conn.commit()

        # Insert Observations
        conn.execute(
            text(
                """
                INSERT INTO timeseries.economic_observations (series_id, observation_date, value)
                SELECT sm.series_id, d.date::date, 1.05 + (random() * 0.1)
                FROM metadata.series_metadata sm
                CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE, '1 day') AS d(date)
                WHERE sm.source_series_id IN ('DEXUSEU', 'FXEURCAD')
                ON CONFLICT DO NOTHING;
                """
            )
        )
        conn.commit()
