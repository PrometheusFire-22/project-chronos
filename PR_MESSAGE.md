fix(geospatial): resolve UTF-8 encoding, add geoalchemy2, and update pre-commit

## Summary
This PR addresses issues encountered during the geospatial ingestion process (CHRONOS-198).

## Changes
- **Fix Encoding:** Resolved a UTF-8 encoding error in `geospatial_cli.py` by adding the encoding declaration.
- **Dependency:** Added `geoalchemy2` to `pyproject.toml` to support geospatial database operations.
- **Pre-commit:** Updated `.pre-commit-config.yaml` to use Python 3.12, resolving compatibility issues with the local environment.

## Status
- ✅ Successfully loaded 5/11 layers:
    - `us_states`
    - `us_counties`
    - `us_cbsa`
    - `us_csa`
    - `us_metdiv`
- ⚠️ Pending/Known Issue:
    - `us_zcta` (ZIP Codes) ingestion stalled due to dataset size (33,791 features). This will be addressed in a follow-up or optimization task.
    - Remaining Canadian layers are pending.

## Verification
- Pre-commit hooks passed locally.
- Manual ingestion test confirmed successful loading of the first 5 US layers.
