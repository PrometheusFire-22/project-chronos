# Correct Territorial Unemployment Rate Vectors

## Problem
The previous vectors (v2064894, v2065083, v2065272) were pulling data from Table 14-10-0287 (monthly, seasonally adjusted) instead of Table 14-10-0292 (3-month moving average, seasonally adjusted).

This resulted in incorrect unemployment values for territories on the map.

## Solution
Identified correct vectors from Statistics Canada Table 14-10-0292-01:
"Labour force characteristics by territory, three-month moving average, seasonally adjusted and unadjusted"

## Correct Vector IDs

| Territory | OLD Vector (WRONG) | NEW Vector (CORRECT) | Latest Value | Latest Date |
|-----------|-------------------|---------------------|--------------|-------------|
| Yukon | v2064894 | **v46438777** | 4.3% | 2025-12 |
| Northwest Territories | v2065083 | **v46438879** | 4.2% | 2025-12 |
| Nunavut | v2065272 | **v99443852** | 15.4% | 2025-12 |

## Vector Details

### Yukon: v46438777
- **Coordinate**: 1.8.1.1.1.1
- **Table**: 14-10-0292-01
- **Aggregation**: 3-month moving average
- **Seasonal Adjustment**: Seasonally adjusted
- **Gender**: Total - Gender
- **Age Group**: 15 years and over
- **Statistics**: Estimate

### Northwest Territories: v46438879
- **Coordinate**: 2.8.1.1.1.1
- **Table**: 14-10-0292-01
- **Aggregation**: 3-month moving average
- **Seasonal Adjustment**: Seasonally adjusted
- **Gender**: Total - Gender
- **Age Group**: 15 years and over
- **Statistics**: Estimate

### Nunavut: v99443852
- **Coordinate**: 3.8.1.1.1.1
- **Table**: 14-10-0292-01
- **Aggregation**: 3-month moving average
- **Seasonal Adjustment**: Seasonally adjusted
- **Gender**: Total - Gender
- **Age Group**: 15 years and over
- **Statistics**: Estimate

## Verification

These values now match the official Statistics Canada website:
- [Labour force characteristics by territory, three-month moving average](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410029201)

## Next Steps

1. ✅ Update catalog CSV with correct vectors
2. Re-ingest territorial data using the new vectors
3. Verify map displays correct unemployment rates
4. Mark old series as inactive or delete observations
