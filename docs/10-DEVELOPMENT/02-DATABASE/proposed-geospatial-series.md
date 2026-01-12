# Proposed State/Province-Level Economic Series

**Status**: Pending Approval
**Date**: 2026-01-12
**Purpose**: Enable choropleth visualization with real economic data

---

## Overview

This document proposes specific economic series for state/province-level geospatial visualization. Series are selected for:
1. **Visual Impact**: Clear geographic variation suitable for choropleth maps
2. **Data Quality**: Reliable, regularly updated from authoritative sources
3. **User Interest**: High relevance for economic analysis
4. **Coverage**: Available for both US states and Canadian provinces

---

## United States - FRED Series

### 1. Unemployment Rate by State (Monthly) ✅ RECOMMENDED
**Series Count**: 51 series (50 states + DC)
**Format**: `{STATE}UR` (e.g., CAUR, TXUR, NYUR)
**Frequency**: Monthly, Not Seasonally Adjusted
**Units**: Percent
**Source**: Bureau of Labor Statistics
**Why**:
- Most frequently updated (monthly)
- Clear geographic variation
- High user interest
- Easy to interpret

**Example Series**:
- CAUR - California Unemployment Rate
- TXUR - Texas Unemployment Rate
- NYUR - New York Unemployment Rate
- FLUR - Florida Unemployment Rate
- ILUR - Illinois Unemployment Rate

### 2. Real GDP by State (Quarterly) ✅ RECOMMENDED
**Series Count**: 51 series (50 states + DC)
**Format**: `{STATE}QGSP` (e.g., CAQGSP, TXQGSP)
**Frequency**: Quarterly
**Units**: Millions of Chained 2017 Dollars
**Source**: Bureau of Economic Analysis
**Why**:
- Fundamental economic indicator
- Shows economic size/power by region
- Useful for economic comparison

**Example Series**:
- CAQGSP - California Real GDP
- TXQGSP - Texas Real GDP
- NYQGSP - New York Real GDP

### 3. Median Household Income by State (Annual) ⚠️ CONSIDER
**Series Count**: 51 series
**Format**: `MEHOINUS{FIPS}A672N` (e.g., MEHOINUSCA672N)
**Frequency**: Annual
**Units**: Dollars
**Source**: Census Bureau
**Why**:
- Important quality of life indicator
- Shows regional economic prosperity
- **Limitation**: Annual only, less dynamic

**Example Series**:
- MEHOINUSCA672N - California Median Household Income
- MEHOINUSTX672N - Texas Median Household Income

### 4. All-Transactions House Price Index by State (Quarterly) ✅ RECOMMENDED
**Series Count**: 51 series
**Format**: `{STATE}STHPI` (e.g., CASTHPI, TXSTHPI)
**Frequency**: Quarterly
**Units**: Index 1980 Q1 = 100
**Source**: Federal Housing Finance Agency
**Why**:
- Housing is major economic indicator
- Clear geographic variation
- Frequently discussed metric

**Example Series**:
- CASTHPI - California House Price Index
- TXSTHPI - Texas House Price Index
- FLSTHPI - Florida House Price Index

### 5. Civilian Labor Force by State (Monthly) ⚠️ OPTIONAL
**Series Count**: 51 series
**Format**: `{STATE}LF` (e.g., CALF, TXLF)
**Frequency**: Monthly
**Units**: Thousands of Persons
**Source**: Bureau of Labor Statistics
**Why**:
- Shows workforce size
- Complements unemployment rate
- **Note**: May be less visually interesting than rates/indexes

---

## Canada - Statistics Canada / Bank of Canada

### 1. Unemployment Rate by Province (Monthly) ✅ RECOMMENDED
**Series Count**: 13 series (10 provinces + 3 territories)
**Source**: Statistics Canada Table 14-10-0287-01
**Frequency**: Monthly
**Units**: Percent
**Why**:
- Direct comparison with US unemployment
- Monthly updates
- Clear provincial variation

**Provinces/Territories**:
- Newfoundland and Labrador
- Prince Edward Island
- Nova Scotia
- New Brunswick
- Quebec
- Ontario
- Manitoba
- Saskatchewan
- Alberta
- British Columbia
- Yukon
- Northwest Territories
- Nunavut

**Note**: Need to identify specific Statistics Canada vector IDs for each province

### 2. Real GDP by Province (Quarterly) ✅ RECOMMENDED
**Series Count**: 13 series
**Source**: Statistics Canada Table 36-10-0402-01
**Frequency**: Quarterly
**Units**: Millions of Chained (2017) Dollars
**Why**:
- Provincial economic output
- Direct comparison with US state GDP
- Fundamental economic measure

### 3. New Housing Price Index by Province (Monthly) ✅ RECOMMENDED
**Series Count**: 10+ series (major provinces)
**Source**: Statistics Canada Table 18-10-0205-01
**Frequency**: Monthly
**Units**: Index 201612 = 100
**Why**:
- Housing is major economic indicator in Canada
- Monthly updates provide dynamic visualization
- Complements US house price data

### 4. Population by Province (Annual) ⚠️ OPTIONAL
**Series Count**: 13 series
**Source**: Statistics Canada Table 17-10-0005-01
**Frequency**: Quarterly estimates, Annual final
**Units**: Persons
**Why**:
- Contextualizes other metrics
- Shows demographic trends
- **Limitation**: Less frequent updates

---

## Recommendation Summary

### Priority 1 (Must Have) - 115 Series Total
1. **US Unemployment Rate by State** (51 series) - Monthly
2. **Canada Unemployment Rate by Province** (13 series) - Monthly
3. **US House Price Index by State** (51 series) - Quarterly

**Total**: 115 series
**Rationale**: These provide the most dynamic, frequently updated data for choropleth visualization with clear geographic variation.

### Priority 2 (Should Have) - 115 Series Total
4. **US Real GDP by State** (51 series) - Quarterly
5. **Canada Real GDP by Province** (13 series) - Quarterly
6. **Canada New Housing Price Index by Province** (10+ series) - Monthly

**Total**: ~74 series
**Rationale**: Fundamental economic indicators that complement unemployment and housing data.

### Priority 3 (Nice to Have) - 116+ Series Total
7. **US Median Household Income by State** (51 series) - Annual
8. **US/Canada Civilian Labor Force** (64 series) - Monthly
9. **Canada Population by Province** (13 series) - Annual

**Total**: ~128 series
**Rationale**: Additional context and depth, but less critical for initial launch.

---

## Implementation Notes

### Data Structure Requirements

1. **Series Metadata Updates**:
   ```sql
   ALTER TABLE metadata.series_metadata
   ADD COLUMN geography_id TEXT,
   ADD COLUMN geography_type TEXT CHECK (geography_type IN ('national', 'state', 'province', 'county', 'metro'));
   ```

2. **Linking Strategy**:
   - US States: Use 2-digit FIPS codes (e.g., '06' for California)
   - Canada Provinces: Use PRUID codes (e.g., '35' for Ontario)
   - Map these to geospatial.us_states.geoid and geospatial.ca_provinces.pruid

3. **Ingestion Order**:
   1. Start with Priority 1 series (unemployment + housing)
   2. Test choropleth rendering with real data
   3. Add Priority 2 series once verified
   4. Expand to Priority 3 as needed

### Total Series Count by Priority

- **Priority 1**: 115 series (most dynamic, monthly/quarterly)
- **Priority 2**: 74 series (fundamental indicators)
- **Priority 3**: 128 series (supplementary data)
- **Grand Total**: ~317 series

---

## Next Steps

1. **Approval**: Review and approve series selection
2. **FRED API Keys**: Verify API limits (FRED allows 120 requests/minute)
3. **Statistics Canada**: Identify specific vector IDs for Canadian series
4. **Ingestion Script**: Create automated ingestion for approved series
5. **Schema Updates**: Add geography_id and geography_type columns
6. **Choropleth Update**: Remove demo data, query real series

---

## Questions for Approval

1. ✅ Approve Priority 1 series (unemployment + housing)?
2. ✅ Approve Priority 2 series (GDP)?
3. ⚠️ Do we want annual series (median income, population)?
4. ⚠️ Should we add labor force data or skip?
5. ⚠️ Any other specific series of interest?

---

## Example Visualization States

With Priority 1 data, users could visualize:
- US unemployment rates across states (monthly updates)
- Canadian unemployment rates across provinces (monthly updates)
- US house price trends by state (quarterly updates)
- Canada housing price trends by province (monthly updates)
- Compare unemployment between US and Canada regions
- Track housing market dynamics geographically

This provides compelling, dynamic choropleth visualizations with frequent updates and clear geographic variation.
