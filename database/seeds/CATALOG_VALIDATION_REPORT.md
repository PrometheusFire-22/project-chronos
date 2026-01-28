# Catalog Enhancement & Validation Report

**Date:** 2026-01-27
**Status:** Ready for Manual Review

## Summary

- **Total Series:** 207
- **Auto-Populated:** 161 (77.8%)
- **Manually Fixed:** 46 (22.2%)
- **Remaining for Review:** 15 (7.2%)

## Automated Enhancements

### FRED Series (✅ 100% Complete)
All FRED series successfully auto-populated from API metadata:
- **Currencies:** GDP, RSXFS (Billions/Millions USD with correct scalars)
- **Percentages:** UNRATE, FEDFUNDS, Treasury Yields (all ×1.0, stored as actual %)
- **Indices:** CPI, S&P 500, NASDAQ (×1.0, no transformation)
- **Counts:** PAYEMS, HOUST (Thousands with ×1000 scalar)

### Valet/StatsCan Series (✅ Manually Added)
Bank of Canada and Statistics Canada series manually configured:
- **CPIs:** V41690973, V41690914 → INDEX, ×1.0
- **GDP:** V62305752, V2062815 → CURRENCY, ×1,000,000 (Millions CAD)
- **Labor:** V2091072 (unemployment), V2091073/74 (employment) → Configured
- **FX Rates:** FXUSDCAD, FXEURCAD, etc. → RATE, ×1.0

## Fixed Issues

### 1. BoC Balance Sheet ✅
- **V39079** → Marked Inactive (was wrong series - interest rate not balance sheet)
- **V36610** → Active, CURRENCY, ×1M, "Millions CAD"

### 2. Discontinued FRED Series ✅
- **NAPM, NAPMNOI** → Marked Inactive

### 3. HOUST Metadata ✅
- **HOUST** → COUNT, ×1000, "Thousands of Units (SAAR)"
- **EXHOSLUSM495S** → COUNT, ×1M, "Millions of Units (SAAR)"

### 4. FX Rates ✅
- All major pairs configured with proper direction labels
- **FXJPYCAD** → "CAD per 100 JPY" (note: quoted per 100 yen)

### 5. Commodities ✅
- **DCOILBRENTEU** → CURRENCY, ×1.0, "USD per Barrel"
- **GOLDAMGBD228NLBM** → CURRENCY, ×1.0, "USD per Troy Ounce"

## Remaining Manual Review (15 Series)

### Canadian Provincial Housing Indices (10 series)
All likely: `unit_type=INDEX, scalar_factor=1.0, display_units="Index 2016=100"` (verify base year)

```
v111955448  New Housing Price Index - Newfoundland and Labrador
v111955454  New Housing Price Index - Prince Edward Island
v111955460  New Housing Price Index - Nova Scotia
v111955466  New Housing Price Index - New Brunswick
v111955472  New Housing Price Index - Québec
v111955490  New Housing Price Index - Ontario
v111955526  New Housing Price Index - Manitoba
v111955532  New Housing Price Index - Saskatchewan
v111955541  New Housing Price Index - Alberta
v111955550  New Housing Price Index - British Columbia
```

### Regional Unemployment Rates (4 series)
All likely: `unit_type=PERCENTAGE, scalar_factor=1.0, display_units="% (percentage points)"`

```
ALUR       Unemployment Rate in Alabama
v2064894   Unemployment Rate - Yukon
v2065083   Unemployment Rate - Northwest Territories
v2065272   Unemployment Rate - Nunavut
```

### Existing Home Sales Variant (1 series)
Likely: `unit_type=COUNT, scalar_factor=1000000.0, display_units="Millions of Units"`

```
EXHOSLUSM495N  Existing Home Sales
```

## Validation Checklist

Before finalizing the catalog, verify:

- [ ] All PERCENTAGE series use scalar_factor=1.0 (APIs return actual %, not decimals)
- [ ] All CURRENCY series have correct magnitude (millions vs billions)
- [ ] All FX rates have direction specified (e.g., "CAD per USD")
- [ ] All provincial/state series have consistent unit_type with national equivalents
- [ ] Duplicate entries removed or marked Inactive
- [ ] V36610 (correct BoC Balance Sheet) is Active, V39079 is Inactive

## Next Steps

1. **Manual Review:** Fix remaining 15 series in `time-series_catalog_fixed.csv`
2. **Finalize:** Rename fixed catalog to replace original:
   ```bash
   mv database/seeds/time-series_catalog_fixed.csv database/seeds/time-series_catalog_expanded.csv
   ```
3. **Update Plugins:** Modify ingestion plugins to apply scalar_factor
4. **Re-ingest:** Delete existing data and re-ingest with correct scalars
5. **Update API/Frontend:** Add unit metadata to responses and display logic

## Notes

- **Scalar Factor Philosophy:** Store absolute values in database (unemployment rate of 5% = 5.0, not 0.05)
- **FRED Behavior:** Already stores percentages as actual percentages (5.0 = 5%)
- **StatsCan Behavior:** Uses scalarFactorCode (0=units, 3=thousands, 6=millions, 9=billions)
- **Valet Behavior:** No standardized metadata - requires manual configuration
