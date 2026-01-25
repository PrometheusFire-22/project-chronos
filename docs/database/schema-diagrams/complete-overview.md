# Complete Schema Overview

```mermaid
graph TB
    subgraph "Metadata Schema"
        DS[data_sources]
        SM[series_metadata]
        IL[ingestion_log]
        SV[schema_version]
    end
    
    subgraph "Timeseries Schema"
        EO[economic_observations<br/>TimescaleDB Hypertable]
    end
    
    subgraph "Analytics Schema"
        DQ[data_quality_dashboard<br/>Materialized View]
        FX[fx_rates_normalized<br/>Materialized View]
        MC[mv_choropleth_boundaries<br/>Materialized View]
        OA[observations_analytics_view<br/>View]
    end
    
    subgraph "Geospatial Schema"
        GEO[8 Geographic Tables<br/>PostGIS Geometry]
    end
    
    subgraph "Economic Graph Schema"
        EDGE[_ag_label_edge<br/>Apache AGE]
        VERTEX[_ag_label_vertex<br/>Apache AGE]
    end
    
    DS -->|provides| SM
    DS -->|tracks| IL
    SM -->|logs| IL
    SM -.->|series_id<br/>missing FK| EO
    
    EO -->|aggregates| DQ
    EO -->|normalizes| FX
    EO -->|analytics| OA
    GEO -->|boundaries| MC
    
    style DS fill:#e1f5ff
    style SM fill:#e1f5ff
    style IL fill:#e1f5ff
    style SV fill:#e1f5ff
    style EO fill:#fff4e1
    style DQ fill:#f0fff0
    style FX fill:#f0fff0
    style MC fill:#f0fff0
    style OA fill:#f0fff0
    style GEO fill:#ffe1f5
    style EDGE fill:#f5e1ff
    style VERTEX fill:#f5e1ff
```

## Schema Purposes

| Schema | Color | Purpose | Tables/Views |
|--------|-------|---------|--------------|
| **Metadata** | 🔵 Blue | Series definitions, data sources, ingestion tracking | 4 tables |
| **Timeseries** | 🟡 Yellow | Time-series observations (hypertable) | 1 table |
| **Analytics** | 🟢 Green | Analytical views and dashboards | 4 views |
| **Geospatial** | 🔴 Pink | Geographic boundaries (PostGIS) | 8 tables |
| **Economic Graph** | 🟣 Purple | Graph database (Apache AGE) | 2 tables |

---

## Data Flow

```mermaid
sequenceDiagram
    participant API as External API
    participant DS as data_sources
    participant SM as series_metadata
    participant EO as economic_observations
    participant IL as ingestion_log
    participant AN as Analytics Views
    
    API->>DS: Fetch data
    DS->>SM: Register series
    SM->>EO: Store observations
    EO->>IL: Log ingestion
    EO->>AN: Refresh views
```

---

## Key Relationships

### Enforced (Foreign Keys)
1. `series_metadata.source_id` → `data_sources.source_id`
2. `ingestion_log.source_id` → `data_sources.source_id`
3. `ingestion_log.series_id` → `series_metadata.series_id`

### Logical (Not Enforced)
1. ⚠️ `economic_observations.series_id` → `series_metadata.series_id` (MISSING FK)

### View Dependencies
1. `data_quality_dashboard` depends on `economic_observations`
2. `fx_rates_normalized` depends on `economic_observations`
3. `observations_analytics_view` depends on `economic_observations`
4. `mv_choropleth_boundaries` depends on `geospatial` tables

---

## Schema Isolation

Each schema serves a distinct purpose with minimal cross-schema dependencies:

- **Metadata**: Self-contained, defines all series and sources
- **Timeseries**: Depends on metadata for series definitions
- **Analytics**: Depends on timeseries for data
- **Geospatial**: Independent, provides geographic context
- **Economic Graph**: Independent, graph relationships

This separation allows for:
- Independent scaling
- Clear ownership boundaries
- Easier testing and maintenance
- Potential future microservices architecture
