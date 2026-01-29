# Data Ingestion Runbook: Practical Operations Guide

## Quick Reference

### Health Check Commands

```bash
# Check database connectivity
psql -h 16.52.210.100 -U chronos -d chronos -c "SELECT NOW();"

# Check ingestion status by source
psql -h 16.52.210.100 -U chronos -d chronos -c "
SELECT
  ds.source_name,
  COUNT(DISTINCT sm.series_id) as series_count,
  COUNT(CASE WHEN EXISTS (
    SELECT 1 FROM timeseries.economic_observations
    WHERE series_id = sm.series_id
  ) THEN 1 END) as series_with_data,
  SUM((SELECT COUNT(*) FROM timeseries.economic_observations WHERE series_id = sm.series_id)) as total_obs
FROM metadata.series_metadata sm
JOIN metadata.data_sources ds ON sm.source_id = ds.source_id
GROUP BY ds.source_name;
"

# Check catalog file
wc -l database/seeds/time-series_catalog.csv

# Test FRED API connectivity
curl -s "https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=${FRED_API_KEY}&file_type=json" | jq '.observations | length'
```

### Common Issues Quick Fix

| Symptom | Cause | Fix |
|---------|-------|-----|
| No data ingested | Status = Inactive | Change to Active in catalog |
| API 401 error | Missing/invalid API key | Set FRED_API_KEY in environment |
| Series not found | Wrong series ID | Verify ID at source website |
| Slow ingestion | Too many API calls | Use --category filter |
| Duplicate data | Re-ingestion without truncate | ON CONFLICT handles this automatically |

---

## Ingestion Procedures

### Procedure 1: Initial Full Ingestion (New Database)

**Use Case**: Fresh database, no existing observations

**Duration**: 1-2 hours for 106 series

**Steps**:

```bash
# 1. Verify database schema is current
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT column_name
  FROM information_schema.columns
  WHERE table_name = 'series_metadata'
    AND column_name IN ('unit_type', 'scalar_factor', 'display_units');
"
# Expected: 3 rows returned

# 2. Check catalog integrity
python3 << EOF
import csv
with open('database/seeds/time-series_catalog.csv') as f:
    reader = csv.DictReader(f, skipinitialspace=True)
    active = [row for row in reader if row.get('status') == 'Active']
    print(f"Active series: {len(active)}")
    # Expected: 106
EOF

# 3. Run full ingestion
poetry run python -m chronos.ingestion.timeseries_cli 2>&1 | tee ingestion_$(date +%Y%m%d_%H%M%S).log

# 4. Verify results
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT
    COUNT(DISTINCT series_id) as series_with_data,
    COUNT(*) as total_observations,
    MIN(observation_date) as earliest_date,
    MAX(observation_date) as latest_date
  FROM timeseries.economic_observations;
"
```

**Expected Results**:
- Series with data: ~46 (if FRED fails, Valet + StatsCan = 31)
- Total observations: ~67,000+
- Earliest date: ~1960s (for US GDP)
- Latest date: Within last month

---

### Procedure 2: Re-Ingestion with Truncate (Scalar Fix)

**Use Case**: Fixing scalar transformations, applying new unit logic

**Duration**: 1-2 hours for 106 series

**⚠️ WARNING**: This deletes ALL existing observations. Backup first!

**Steps**:

```bash
# 1. Backup existing data
pg_dump -h 16.52.210.100 -U chronos -d chronos \
  -t timeseries.economic_observations \
  -t metadata.series_metadata \
  > backup_before_reingestion_$(date +%Y%m%d).sql

# Verify backup
ls -lh backup_before_reingestion_*.sql

# 2. Truncate observations (keeps metadata)
psql -h 16.52.210.100 -U chronos -d chronos -c "
  TRUNCATE timeseries.economic_observations;
  SELECT 'Observations truncated. Series metadata preserved.' as status;
"

# 3. Verify empty
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT COUNT(*) as should_be_zero FROM timeseries.economic_observations;
"

# 4. Run full ingestion
poetry run python -m chronos.ingestion.timeseries_cli 2>&1 | tee reingestion_$(date +%Y%m%d_%H%M%S).log

# 5. Validate scalar transformations
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT
    sm.source_series_id,
    sm.series_name,
    sm.unit_type,
    sm.scalar_factor,
    MIN(eo.value) as min_value,
    MAX(eo.value) as max_value,
    AVG(eo.value) as avg_value
  FROM metadata.series_metadata sm
  JOIN timeseries.economic_observations eo ON sm.series_id = eo.series_id
  WHERE sm.source_series_id IN ('UNRATE', 'GDP', 'HOUST', 'CPIAUCSL')
  GROUP BY sm.series_id
  ORDER BY sm.source_series_id;
"

# Expected ranges:
# UNRATE: 3-8% (not 0.03-0.08)
# GDP: > 1 billion (not 123.45)
# HOUST: > 500 (not 0.5)
# CPIAUCSL: 200-400 (index value)
```

**Rollback Procedure** (if needed):
```bash
# Truncate again
psql -h 16.52.210.100 -U chronos -d chronos -c "TRUNCATE timeseries.economic_observations;"

# Restore from backup
psql -h 16.52.210.100 -U chronos -d chronos < backup_before_reingestion_YYYYMMDD.sql
```

---

### Procedure 3: Incremental Update (Daily/Weekly)

**Use Case**: Regular updates to existing data

**Duration**: 5-15 minutes

**Steps**:

```bash
# 1. Check last ingestion time
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT
    ds.source_name,
    MAX(il.ingestion_end) as last_ingestion
  FROM metadata.ingestion_log il
  JOIN metadata.data_sources ds ON il.source_id = ds.source_id
  WHERE il.status = 'success'
  GROUP BY ds.source_name
  ORDER BY ds.source_name;
"

# 2. Run incremental ingestion (ON CONFLICT updates existing)
poetry run python -m chronos.ingestion.timeseries_cli 2>&1 | tee incremental_$(date +%Y%m%d_%H%M%S).log

# 3. Check for new observations
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT
    observation_date,
    COUNT(*) as series_count
  FROM timeseries.economic_observations
  WHERE observation_date >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY observation_date
  ORDER BY observation_date DESC;
"
```

---

### Procedure 4: Staged Ingestion (Low Resource)

**Use Case**: Laptop on battery, limited bandwidth, avoid overwhelming machine

**Duration**: 5-10 minutes per stage

**Stage 1: US Core National Indicators** (~20 series)

```bash
# Growth indicators
poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --geography "United States" \
  --category Growth

# Employment indicators
poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --geography "United States" \
  --category Employment

# Inflation indicators
poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --geography "United States" \
  --category Inflation

# Validate
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT category, COUNT(*) as ingested
  FROM metadata.series_metadata sm
  WHERE EXISTS (SELECT 1 FROM timeseries.economic_observations WHERE series_id = sm.series_id)
    AND geography = 'United States'
    AND category IN ('Growth', 'Employment', 'Inflation')
  GROUP BY category;
"
```

**Stage 2: US Financial Markets** (~15 series)

```bash
poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --category "Interest Rates"

poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --category Equities

poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --category Spreads
```

**Stage 3: Canadian Data** (Already complete ✅)

```bash
# Verify Canadian data is complete
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT
    ds.source_name,
    COUNT(DISTINCT sm.series_id) as series_count,
    SUM((SELECT COUNT(*) FROM timeseries.economic_observations WHERE series_id = sm.series_id)) as obs_count
  FROM metadata.series_metadata sm
  JOIN metadata.data_sources ds ON sm.source_id = ds.source_id
  WHERE ds.source_name IN ('Bank of Canada Valet API', 'Statistics Canada')
  GROUP BY ds.source_name;
"
# Expected: Valet 11 series (20K+ obs), StatsCan 20 series (10K+ obs)
```

**Stage 4: Commodities & FX** (~10 series)

```bash
poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --category Currency

poetry run python -m chronos.ingestion.timeseries_cli \
  --source FRED \
  --category Energy
```

---

### Procedure 5: Single Series Debugging

**Use Case**: One series failing, need to isolate issue

**Steps**:

```bash
# 1. Check if series exists in catalog
grep "UNRATE" database/seeds/time-series_catalog.csv

# 2. Check if series exists in database metadata
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT sm.*, ds.source_name
  FROM metadata.series_metadata sm
  JOIN metadata.data_sources ds ON sm.source_id = ds.source_id
  WHERE sm.source_series_id = 'UNRATE';
"

# 3. Test API directly
curl -s "https://api.stlouisfed.org/fred/series/observations?series_id=UNRATE&api_key=${FRED_API_KEY}&file_type=json" | jq '.observations | length'

# 4. Run ingestion for this series only
poetry run python -m chronos.ingestion.timeseries_cli --series UNRATE 2>&1 | tee debug_UNRATE.log

# 5. Check observations
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT
    eo.observation_date,
    eo.value,
    sm.unit_type,
    sm.display_units
  FROM timeseries.economic_observations eo
  JOIN metadata.series_metadata sm ON eo.series_id = sm.series_id
  WHERE sm.source_series_id = 'UNRATE'
  ORDER BY eo.observation_date DESC
  LIMIT 10;
"
```

---

## Monitoring

### Daily Health Check

```bash
#!/bin/bash
# Save as: scripts/ingestion_health_check.sh

echo "=== Data Ingestion Health Check ==="
echo "Date: $(date)"
echo ""

# 1. Database connectivity
echo "1. Database connectivity..."
if psql -h 16.52.210.100 -U chronos -d chronos -c "SELECT 1;" &>/dev/null; then
  echo "   ✅ Database online"
else
  echo "   ❌ Database unreachable"
  exit 1
fi

# 2. Series with data
echo ""
echo "2. Series status..."
psql -h 16.52.210.100 -U chronos -d chronos -t -c "
SELECT
  RPAD(ds.source_name, 30) ||
  RPAD(CAST(COUNT(DISTINCT sm.series_id) AS TEXT), 10) ||
  RPAD(CAST(COUNT(CASE WHEN EXISTS (SELECT 1 FROM timeseries.economic_observations WHERE series_id = sm.series_id) THEN 1 END) AS TEXT), 10) ||
  RPAD(CAST(SUM((SELECT COUNT(*) FROM timeseries.economic_observations WHERE series_id = sm.series_id)) AS TEXT), 15)
FROM metadata.series_metadata sm
JOIN metadata.data_sources ds ON sm.source_id = ds.source_id
GROUP BY ds.source_name;
" | while read line; do
  echo "   $line"
done

# 3. Data freshness (days since last observation)
echo ""
echo "3. Data freshness (days since latest observation)..."
psql -h 16.52.210.100 -U chronos -d chronos -t -c "
SELECT
  RPAD(ds.source_name, 30) ||
  RPAD(CAST(CURRENT_DATE - MAX(eo.observation_date) AS TEXT), 10) || ' days ago'
FROM timeseries.economic_observations eo
JOIN metadata.series_metadata sm ON eo.series_id = sm.series_id
JOIN metadata.data_sources ds ON sm.source_id = ds.source_id
GROUP BY ds.source_name;
" | while read line; do
  if [[ $line =~ ([0-9]+)\ days ]]; then
    days=${BASH_REMATCH[1]}
    if [ $days -gt 30 ]; then
      echo "   ⚠️  $line"
    else
      echo "   ✅ $line"
    fi
  fi
done

# 4. Last ingestion status
echo ""
echo "4. Last ingestion jobs..."
psql -h 16.52.210.100 -U chronos -d chronos -t -c "
SELECT
  TO_CHAR(il.ingestion_start, 'YYYY-MM-DD HH24:MI') ||
  '  ' || RPAD(ds.source_name, 30) ||
  '  ' || il.status ||
  '  (' || il.records_inserted || ' inserted)'
FROM metadata.ingestion_log il
JOIN metadata.data_sources ds ON il.source_id = ds.source_id
ORDER BY il.ingestion_start DESC
LIMIT 5;
" | while read line; do
  if [[ $line =~ success ]]; then
    echo "   ✅ $line"
  elif [[ $line =~ failed ]]; then
    echo "   ❌ $line"
  else
    echo "   $line"
  fi
done

echo ""
echo "=== Health Check Complete ==="
```

**Run Daily**:
```bash
chmod +x scripts/ingestion_health_check.sh
./scripts/ingestion_health_check.sh
```

**Expected Output**:
```
=== Data Ingestion Health Check ===
Date: Wed Jan 29 10:30:00 UTC 2026

1. Database connectivity...
   ✅ Database online

2. Series status...
   Bank of Canada Valet API       11        11        20431
   Federal Reserve Economic Data   141       15        36662
   Statistics Canada               20        20        10692

3. Data freshness (days since latest observation)...
   ✅ Bank of Canada Valet API       2 days ago
   ⚠️  Federal Reserve Economic Data  45 days ago
   ✅ Statistics Canada               7 days ago

4. Last ingestion jobs...
   ✅ 2026-01-28 22:15  Statistics Canada              success  (600 inserted)
   ✅ 2026-01-28 22:10  Bank of Canada Valet API       success  (2263 inserted)
   ❌ 2026-01-28 21:50  Federal Reserve Economic Data  failed  (0 inserted)

=== Health Check Complete ===
```

---

### Automated Scheduling (Cron)

```bash
# Edit crontab
crontab -e

# Add daily ingestion at 3 AM
0 3 * * * cd /home/prometheus/coding/finance/project-chronos && poetry run python -m chronos.ingestion.timeseries_cli >> /var/log/chronos/ingestion.log 2>&1

# Add weekly health check email
0 9 * * 1 /home/prometheus/coding/finance/project-chronos/scripts/ingestion_health_check.sh | mail -s "Chronos Ingestion Health" geoff@automatonicai.com
```

---

## Emergency Procedures

### Emergency 1: Database Full / Out of Space

**Symptoms**:
- INSERT errors: `ERROR: could not extend file... No space left on device`
- Disk usage > 90%

**Immediate Actions**:
```bash
# 1. Check disk usage
df -h /var/lib/postgresql

# 2. Find largest tables
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT
    schemaname || '.' || tablename as table_name,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
  FROM pg_tables
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
  LIMIT 10;
"

# 3. Archive old data (if timeseries > 10 years old)
# Create archive table
psql -h 16.52.210.100 -U chronos -d chronos -c "
  CREATE TABLE timeseries.economic_observations_archive (LIKE timeseries.economic_observations INCLUDING ALL);
"

# Move data older than 10 years
psql -h 16.52.210.100 -U chronos -d chronos -c "
  INSERT INTO timeseries.economic_observations_archive
  SELECT * FROM timeseries.economic_observations
  WHERE observation_date < CURRENT_DATE - INTERVAL '10 years';

  DELETE FROM timeseries.economic_observations
  WHERE observation_date < CURRENT_DATE - INTERVAL '10 years';
"

# 4. Vacuum to reclaim space
psql -h 16.52.210.100 -U chronos -d chronos -c "VACUUM FULL timeseries.economic_observations;"
```

---

### Emergency 2: Ingestion Stuck / Hanging

**Symptoms**:
- CLI runs for > 3 hours without progress
- High CPU but no database writes

**Actions**:
```bash
# 1. Find process ID
ps aux | grep timeseries_cli

# 2. Check database connections
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT pid, state, query_start, LEFT(query, 50)
  FROM pg_stat_activity
  WHERE datname = 'chronos' AND state != 'idle';
"

# 3. Kill long-running queries (if > 30 minutes)
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE datname = 'chronos'
    AND state != 'idle'
    AND query_start < NOW() - INTERVAL '30 minutes';
"

# 4. Kill CLI process
pkill -9 -f timeseries_cli

# 5. Check ingestion_log for errors
psql -h 16.52.210.100 -U chronos -d chronos -c "
  SELECT * FROM metadata.ingestion_log
  WHERE status = 'running'
  ORDER BY ingestion_start DESC
  LIMIT 5;
"

# 6. Manually set stuck jobs to 'failed'
psql -h 16.52.210.100 -U chronos -d chronos -c "
  UPDATE metadata.ingestion_log
  SET status = 'failed',
      error_message = 'Manually terminated - stuck process',
      ingestion_end = NOW()
  WHERE status = 'running'
    AND ingestion_start < NOW() - INTERVAL '2 hours';
"
```

---

### Emergency 3: API Rate Limit Exceeded

**Symptoms**:
- FRED returns `429 Too Many Requests`
- Ingestion fails after ~50 series

**Actions**:
```bash
# 1. Check rate limit status (FRED)
curl -s "https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=${FRED_API_KEY}&file_type=json" \
  -D - -o /dev/null | grep -i "x-ratelimit"

# 2. Increase delay between requests
# Edit: src/chronos/ingestion/fred.py
# Change: time.sleep(2) → time.sleep(5)

# 3. Resume ingestion with subset
# Only ingest series that failed
psql -h 16.52.210.100 -U chronos -d chronos -t -c "
  SELECT source_series_id
  FROM metadata.series_metadata sm
  JOIN metadata.data_sources ds ON sm.source_id = ds.source_id
  WHERE ds.source_name = 'Federal Reserve Economic Data'
    AND NOT EXISTS (SELECT 1 FROM timeseries.economic_observations WHERE series_id = sm.series_id);
" > failed_series.txt

# Run for each series with delay
while read series; do
  poetry run python -m chronos.ingestion.timeseries_cli --series $series
  sleep 10  # Extra delay between series
done < failed_series.txt
```

---

## Performance Tuning

### Optimize Batch Size

**Current**: 100 observations per INSERT

**Test Larger Batches**:
```bash
# Edit: src/chronos/ingestion/timeseries_cli.py
# Find: batch_size = 100
# Change to: batch_size = 500

# Benchmark
time poetry run python -m chronos.ingestion.timeseries_cli --series UNRATE

# Expected improvement: 30-50% faster
```

### Use Connection Pooling

**Current**: Single connection per run

**Improvement**: SQLAlchemy connection pooling

```python
# src/chronos/ingestion/database.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10
)
```

---

## Validation Queries

### Check Data Integrity

```sql
-- 1. Find series with missing observations (gaps > 90 days)
WITH gaps AS (
  SELECT
    series_id,
    observation_date,
    LEAD(observation_date) OVER (PARTITION BY series_id ORDER BY observation_date) as next_date,
    LEAD(observation_date) OVER (PARTITION BY series_id ORDER BY observation_date) - observation_date as gap_days
  FROM timeseries.economic_observations
)
SELECT
  sm.source_series_id,
  sm.series_name,
  sm.frequency,
  g.observation_date as gap_start,
  g.next_date as gap_end,
  g.gap_days
FROM gaps g
JOIN metadata.series_metadata sm ON g.series_id = sm.series_id
WHERE g.gap_days > 90
ORDER BY g.gap_days DESC;

-- 2. Find series with suspicious values (outliers)
SELECT
  sm.source_series_id,
  sm.series_name,
  sm.unit_type,
  MIN(eo.value) as min_value,
  MAX(eo.value) as max_value,
  AVG(eo.value) as avg_value,
  STDDEV(eo.value) as stddev_value
FROM timeseries.economic_observations eo
JOIN metadata.series_metadata sm ON eo.series_id = sm.series_id
GROUP BY sm.series_id
HAVING STDDEV(eo.value) > 1000 OR MIN(eo.value) < -1000
ORDER BY STDDEV(eo.value) DESC;

-- 3. Find duplicate observations
SELECT
  sm.source_series_id,
  eo.observation_date,
  COUNT(*) as duplicate_count
FROM timeseries.economic_observations eo
JOIN metadata.series_metadata sm ON eo.series_id = sm.series_id
GROUP BY sm.series_id, eo.observation_date
HAVING COUNT(*) > 1;
```

---

## Contact & Escalation

**Primary Contact**: geoff@automatonicai.com

**Escalation Path**:
1. Check ingestion logs: `/var/log/chronos/ingestion.log`
2. Check database logs: `sudo journalctl -u postgresql`
3. Review Jira tickets: CHRONOS-470, CHRONOS-467
4. Post in Slack: #chronos-alerts

**External Support**:
- FRED API: https://fred.stlouisfed.org/docs/api/fred/
- Bank of Canada: https://www.bankofcanada.ca/valet/docs
- Statistics Canada: https://www.statcan.gc.ca/en/developers
