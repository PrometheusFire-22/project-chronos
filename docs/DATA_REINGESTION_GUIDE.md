# Data Re-Ingestion Guide
**Date:** 2026-01-27
**Purpose:** Complete data refresh with correct scalar transformations

---

## ⚠️ CRITICAL: Prerequisites Before Re-Ingestion

### 1. Finalize Catalog (15 Series Remaining)

Edit `/database/seeds/time-series_catalog_fixed.csv` and fix these entries:

**Provincial Housing Indices (10 series):**
```csv
v111955448,StatsCan,Active,...,INDEX,1.0,Index 2016=100
v111955454,StatsCan,Active,...,INDEX,1.0,Index 2016=100
v111955460,StatsCan,Active,...,INDEX,1.0,Index 2016=100
v111955466,StatsCan,Active,...,INDEX,1.0,Index 2016=100
v111955472,StatsCan,Active,...,INDEX,1.0,Index 2016=100
v111955490,StatsCan,Active,...,INDEX,1.0,Index 2016=100
v111955526,StatsCan,Active,...,INDEX,1.0,Index 2016=100
v111955532,StatsCan,Active,...,INDEX,1.0,Index 2016=100
v111955541,StatsCan,Active,...,INDEX,1.0,Index 2016=100
v111955550,StatsCan,Active,...,INDEX,1.0,Index 2016=100
```

**Regional Unemployment Rates (4 series):**
```csv
ALUR,FRED,Active,...,PERCENTAGE,1.0,% (percentage points)
v2064894,StatsCan,Active,...,PERCENTAGE,1.0,% (percentage points)
v2065083,StatsCan,Active,...,PERCENTAGE,1.0,% (percentage points)
v2065272,StatsCan,Active,...,PERCENTAGE,1.0,% (percentage points)
```

**Existing Home Sales Variant:**
```csv
EXHOSLUSM495N,FRED,Active,...,COUNT,1000000.0,Millions of Units
```

### 2. Replace Catalog
```bash
mv database/seeds/time-series_catalog_fixed.csv database/seeds/time-series_catalog_expanded.csv
```

---

## Option 1: Staged Ingestion (LOW CPU, NO CHARGER) ⭐ RECOMMENDED

### Stage 1: US Core Indicators (~20 series, ~5 min)
```bash
cd /home/prometheus/coding/finance/project-chronos

# Growth indicators
poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --geography "United States" \
  --category Growth

# Employment
poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --geography "United States" \
  --category Employment

# Inflation
poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --geography "United States" \
  --category Inflation
```

**Validate Stage 1:**
```bash
poetry run python -c "
from chronos.ingestion.timeseries_cli import get_db_connection
conn = get_db_connection()
cursor = conn.cursor()
cursor.execute('SELECT COUNT(*) FROM timeseries.economic_observations')
print(f'Observations: {cursor.fetchone()[0]:,}')
cursor.execute('SELECT COUNT(DISTINCT series_id) FROM timeseries.economic_observations')
print(f'Series: {cursor.fetchone()[0]}')
"
```

### Stage 2: Canadian National Data (~30 series, ~10 min)
```bash
# Valet (Bank of Canada)
poetry run python -m chronos.ingestion.timeseries_cli \
  --source Valet \
  --geography "Canada"

# StatsCan (Statistics Canada)
poetry run python -m chronos.ingestion.timeseries_cli \
  --source StatsCan \
  --geography "Canada" \
  --geo-type "National"
```

### Stage 3: US State-Level Data (~50 series, ~15 min)
```bash
poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --geo-type "State"
```

### Stage 4: Canadian Provincial Data (~30 series, ~10 min)
```bash
poetry run python -m chronos.ingestion.timeseries_cli \
  --source StatsCan \
  --geo-type "Province"
```

### Stage 5: Financial Markets (~40 series, ~15 min)
```bash
poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --category "Financial Markets"
```

**Total Time:** ~55 minutes (can be spread across multiple sessions)

---

## Option 2: Background Ingestion (OVERNIGHT, WITH CHARGER)

### Clear Existing Data
```bash
poetry run python -c "
from chronos.ingestion.timeseries_cli import get_db_connection
conn = get_db_connection()
cursor = conn.cursor()
cursor.execute('TRUNCATE timeseries.economic_observations')
conn.commit()
print('✅ All observations cleared')
cursor.execute('SELECT COUNT(*) FROM metadata.series_metadata')
print(f'Metadata retained: {cursor.fetchone()[0]} series')
"
```

### Run Full Ingestion
```bash
cd /home/prometheus/coding/finance/project-chronos

# Run in background with nohup
nohup poetry run python -m chronos.ingestion.timeseries_cli > logs/ingestion_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Check progress
tail -f logs/ingestion_*.log

# Or use tmux/screen for safer background execution
tmux new -s ingestion
poetry run python -m chronos.ingestion.timeseries_cli
# Ctrl+B, D to detach
# tmux attach -t ingestion to reattach
```

**Expected Duration:** 1-2 hours for all 207 series

---

## Option 3: Selective Ingestion by Geography

### US National Only
```bash
poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --geography "United States"
```

### Canada National Only
```bash
poetry run python -m chronos.ingestion.timeseries_cli \
  --source Valet

poetry run python -m chronos.ingestion.timeseries_cli \
  --source StatsCan \
  --geography "Canada" \
  --geo-type "National"
```

### All US Data (National + State)
```bash
poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED
```

### All Canadian Data (National + Provincial)
```bash
poetry run python -m chronos.ingestion.timeseries_cli \
  --source Valet

poetry run python -m chronos.ingestion.timeseries_cli \
  --source StatsCan
```

---

## Validation & Verification

### Check Scalar Transformations Worked
```bash
poetry run python -c "
from chronos.ingestion.timeseries_cli import get_db_connection
conn = get_db_connection()
cursor = conn.cursor()

# Check unemployment rate (should be 3-8%, not 0.03-0.08)
cursor.execute('''
    SELECT sm.series_name, eo.value, sm.unit_type, sm.scalar_factor
    FROM timeseries.economic_observations eo
    JOIN metadata.series_metadata sm ON eo.series_id = sm.series_id
    WHERE sm.source_series_id = 'UNRATE'
    ORDER BY eo.observation_date DESC
    LIMIT 5
''')
print('Unemployment Rate (should be 3-8%):')
for row in cursor.fetchall():
    print(f'  {row[0]}: {row[1]:.2f}% (type={row[2]}, scalar={row[3]})')

# Check GDP (should be billions, not millions)
cursor.execute('''
    SELECT sm.series_name, eo.value, sm.unit_type, sm.scalar_factor
    FROM timeseries.economic_observations eo
    JOIN metadata.series_metadata sm ON eo.series_id = sm.series_id
    WHERE sm.source_series_id = 'GDP'
    ORDER BY eo.observation_date DESC
    LIMIT 3
''')
print('\nGDP (should be ~20,000-28,000 billions):')
for row in cursor.fetchall():
    print(f'  {row[0]}: ${row[1]:,.1f}B (type={row[2]}, scalar={row[3]})')
"
```

### Check Data Quality
```bash
poetry run python -c "
from chronos.ingestion.timeseries_cli import get_db_connection
conn = get_db_connection()
cursor = conn.cursor()

cursor.execute('''
    SELECT
        sm.unit_type,
        COUNT(DISTINCT sm.series_id) as series_count,
        COUNT(eo.value) as obs_count
    FROM metadata.series_metadata sm
    LEFT JOIN timeseries.economic_observations eo ON sm.series_id = eo.series_id
    WHERE sm.is_active = TRUE
    GROUP BY sm.unit_type
    ORDER BY series_count DESC
''')

print('Series & Observations by Unit Type:')
for row in cursor.fetchall():
    print(f'  {row[0]:12} → {row[1]:3} series, {row[2]:,} observations')
"
```

---

## Troubleshooting

### API Rate Limits
If you hit FRED rate limits (429 errors):
```bash
# Increase sleep time in plugins
# Edit: apps/chronos-api/src/chronos/ingestion/fred.py
# Change: time.sleep(2 + attempt) → time.sleep(5 + attempt)
```

### Memory Issues
If Python process crashes:
```bash
# Reduce batch size
# Edit: apps/chronos-api/src/chronos/ingestion/timeseries_cli.py
# Line ~186: if len(batch) >= 100: → if len(batch) >= 50:
```

### Resume Failed Ingestion
The CLI is idempotent - just re-run the same command. It will skip series already ingested (checks metadata table).

---

## Post-Ingestion Tasks

1. **Delete apply_data_fixes.py** (no longer needed)
   ```bash
   git rm scripts/apply_data_fixes.py
   git commit -m "chore: remove deprecated manual data fix script"
   ```

2. **Update Frontend** to display unit metadata
3. **Update API** to return unit_type and display_units
4. **Create Validation Dashboard** for ongoing data quality monitoring

---

## Rollback Plan

If something goes wrong:
```bash
# Restore from backup (if you made one)
pg_restore -d chronos_db chronos_backup.sql

# Or re-run migration rollback
poetry run python -m chronos.database.migrations.003_add_unit_metadata --rollback

# Then re-apply migration
poetry run python -m chronos.database.migrations.003_add_unit_metadata
```
