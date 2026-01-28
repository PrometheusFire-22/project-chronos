# Catalog Data Quality Fixes

## Issues to Fix (from audit)

### 1. BoC Balance Sheet - Wrong Series ID
**Problem:** Using V39079 (an interest rate) instead of V36610 (Total Assets)
**Fix:** Update catalog to use V36610
**Expected Value:** Hundreds of Billions CAD (not ~2 million)

### 2. Duplicate Entries
**Problem:** Multiple entries for same economic indicator
**Duplicates Found:**
- Federal Funds Effective Rate: DFF (Daily) + FEDFUNDS (Monthly) - both valid, need disambiguation
- US GDP: Multiple versions with different source_ids
- Canada CPI: Appears in both FRED and StatsCan

**Fix:**
- Keep DFF and FEDFUNDS but clarify frequency in series_name
- Keep primary version, mark duplicates as Inactive

### 3. HOUST Metadata
**Problem:** Units inconsistently labeled
**Fix:** Standardize as COUNT, ×1000, "Thousands of Units (SAAR)"

### 4. Mexico FX (DEXMXUS)
**Problem:** Shows Mexican Pesos per USD, but we need USD per Peso for consistency
**Fix:** Add inversion flag or update metadata to clarify direction

### 5. Discontinued Series
**Problem:** NAPM and NAPMNOI return 400 errors (discontinued by FRED)
**Fix:** Mark as status="Inactive" or replace with current series (ISM PMI equivalents may exist)

## Manual Review Needed

### Valet Series (Bank of Canada)
All Valet series need manual unit metadata since BoC API doesn't provide:
- V41690973: CPI (INDEX, ×1.0)
- V62305752: GDP (CURRENCY, need to check if millions or billions)
- V2091072: Unemployment Rate (PERCENTAGE, ×1.0)
- V735: Housing Starts (COUNT, need to verify scalar)
- FXUSDCAD: FX Rate (RATE, ×1.0, "CAD per USD")

### StatsCan Series
StatsCan API has scalarFactorCode but script may have failed - needs retry or manual entry.
