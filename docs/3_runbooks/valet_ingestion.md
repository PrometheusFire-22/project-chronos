# Valet Data Ingestion Runbook

## Overview

Bank of Canada Valet API provides Canadian economic data.

## Daily Operations

### Run Ingestion

```bash
python src/scripts/time-series_ingest.py
```

### Verify Success

```bash
psql -h chronos-db -U prometheus -d chronos_db -c "
SELECT source_name, COUNT(*) as obs_count
FROM metadata.data_sources ds
JOIN metadata.series_metadata sm ON ds.source_id = sm.source_id
JOIN timeseries.economic_observations eo ON sm.series_id = eo.series_id
WHERE source_name = 'VALET'
GROUP BY source_name;"
```

### Troubleshooting

**Issue:** "Series not found in Valet"

- Verify series ID at: https://www.bankofcanada.ca/valet/docs
- Update catalog with correct ID

**Issue:** Network timeout

- Valet API can be slow
- Script has 30s timeout with 3 retries
- If persistent, check API status

## Adding New Series

1. Find series at: https://www.bankofcanada.ca/valet/observations/SERIES_ID/json
2. Add to `database/seeds/time-series_catalog.csv`:

```csv
   SERIES_ID,Valet,Active,Series Name,Category,National,Canada,Frequency,Category,Subcategory
```

3. Run ingestion

## API Documentation

https://www.bankofcanada.ca/valet/docs
