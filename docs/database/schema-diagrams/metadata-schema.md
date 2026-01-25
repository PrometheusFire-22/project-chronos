# Metadata Schema - Entity Relationship Diagram

```mermaid
erDiagram
    data_sources ||--o{ series_metadata : "provides"
    data_sources ||--o{ ingestion_log : "tracks"
    series_metadata ||--o{ ingestion_log : "logs"
    
    data_sources {
        text source_id PK
        text source_name
        text api_endpoint
        boolean api_key_required
        integer rate_limit_per_minute
        timestamp last_successful_fetch
        timestamp created_at
        timestamp updated_at
    }
    
    series_metadata {
        integer series_id PK
        text source_id FK
        text source_series_id
        text series_name
        text frequency
        text units
        text seasonal_adjustment
        timestamp last_updated
        timestamp created_at
        timestamp updated_at
        text geography_type
        text geography_id
    }
    
    ingestion_log {
        integer log_id PK
        text source_id FK
        integer series_id FK
        timestamp ingestion_timestamp
        text status
        integer records_inserted
        text error_message
    }
    
    schema_version {
        integer version_id PK
        text version_number
        text description
        timestamp applied_at
    }
```

## Relationships

### data_sources → series_metadata
- **Type**: One-to-Many
- **FK**: `series_metadata.source_id` → `data_sources.source_id`
- **Description**: Each data source can provide multiple time series

### data_sources → ingestion_log
- **Type**: One-to-Many
- **FK**: `ingestion_log.source_id` → `data_sources.source_id`
- **Description**: Each data source has multiple ingestion log entries

### series_metadata → ingestion_log
- **Type**: One-to-Many
- **FK**: `ingestion_log.series_id` → `series_metadata.series_id`
- **Description**: Each series has multiple ingestion log entries

---

## Key Observations

1. **Well-Defined Relationships**: All foreign keys properly defined with referential integrity
2. **Audit Trail**: `ingestion_log` provides comprehensive tracking of data ingestion
3. **Versioning**: `schema_version` tracks database migrations
4. **Unique Constraints**: Composite unique index on `(source_id, source_series_id)` prevents duplicates
