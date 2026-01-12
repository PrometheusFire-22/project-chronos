# Geospatial Sprint Plan: Leaflet MVP

**Sprint**: Phase 1 - Leaflet Choropleth Maps
**Duration**: 2-3 weeks (10-15 working days)
**Status**: Ready to Start
**Epic**: CHRONOS-404

---

## Sprint Goal

Ship interactive choropleth maps displaying economic indicators by US county and Canadian province, using Leaflet with OSM tiles.

---

## Architecture Decision

### Phase 1 (This Sprint): Leaflet + OSM
- Simple, fast, proven
- Zero tile server setup
- DOM-based rendering
- Perfect for MVP (<1,000 features)

### Phase 2 (Future Sprint): deck.gl + Maplibre
- GPU-accelerated heatmaps
- WebGL rendering (learn once for both)
- Maptiler vector tiles
- Handles >10K features

**Decision**: Skip standalone Maplibre GL phase. Go directly from Leaflet → deck.gl when GPU features needed.

---

## Jira Tickets

### 🎯 Epic: CHRONOS-404 - Geospatial Visualization Phase 1

**Description**: Implement interactive choropleth maps using Leaflet to visualize economic indicators by geographic region (US counties, Canadian provinces).

**Acceptance Criteria**:
- [ ] Users can view choropleth map at `/analytics/geospatial`
- [ ] Map displays US counties or Canadian provinces
- [ ] Color scale represents selected economic indicator
- [ ] Legend shows value ranges
- [ ] Hover shows region name + value
- [ ] Mobile responsive
- [ ] Loads in <3 seconds on 3G

---

### Ticket 1: CHRONOS-405 - Load Geospatial Boundaries into PostGIS

**Type**: Technical Task
**Story Points**: 3
**Priority**: Highest (Blocker)

**Description**:
Load US counties and Canadian provinces SQL dumps into PostgreSQL database. Verify spatial indexes and test GeoJSON export.

**Tasks**:
1. Load `us_counties.sql` into database
2. Load `ca_provinces.sql` into database
3. Verify `geospatial` schema created
4. Confirm spatial indexes (GIST) exist
5. Test GeoJSON export for sample county
6. Document row counts and table sizes

**Acceptance Criteria**:
- [ ] `geospatial.us_counties` table exists with ~3,200 rows
- [ ] `geospatial.ca_provinces` table exists with ~13 rows
- [ ] Spatial indexes (`idx_*_geom`) created on geometry columns
- [ ] Can export single county as GeoJSON via SQL query
- [ ] Total database size increase documented

**SQL Verification**:
```sql
-- Verify tables
SELECT COUNT(*) FROM geospatial.us_counties;
SELECT COUNT(*) FROM geospatial.ca_provinces;

-- Check indexes
SELECT indexname FROM pg_indexes
WHERE schemaname = 'geospatial';

-- Test GeoJSON export
SELECT ST_AsGeoJSON(geometry)
FROM geospatial.us_counties
WHERE statefp = '06' AND countyfp = '037'
LIMIT 1;
```

**Dependencies**: None
**Estimated Time**: 2-3 hours

---

### Ticket 2: CHRONOS-406 - Design GeoJSON API Endpoints

**Type**: Technical Task
**Story Points**: 5
**Priority**: High

**Description**:
Create Next.js API routes to serve GeoJSON boundaries from PostGIS. Support filtering by geography (US/Canada) and aggregation level (county/province/state).

**API Endpoints to Create**:

1. `GET /api/geospatial/boundaries`
   - Query params: `geography=US|CANADA`, `level=county|province|state`
   - Returns: GeoJSON FeatureCollection
   - Example: `/api/geospatial/boundaries?geography=US&level=county`

2. `GET /api/geospatial/boundaries/[id]`
   - Returns: Single GeoJSON Feature by ID
   - Example: `/api/geospatial/boundaries/06037` (LA County)

3. `GET /api/geospatial/choropleth`
   - Query params: `geography`, `level`, `seriesId`, `date`
   - Returns: GeoJSON with `value` property for choropleth coloring
   - Example: `/api/geospatial/choropleth?geography=US&level=county&seriesId=71&date=2024-01-01`

**Tasks**:
1. Create `apps/web/app/api/geospatial/boundaries/route.ts`
2. Create `apps/web/app/api/geospatial/boundaries/[id]/route.ts`
3. Create `apps/web/app/api/geospatial/choropleth/route.ts`
4. Add PostGIS `ST_AsGeoJSON` query logic
5. Implement geography/level filtering
6. Add caching headers (`Cache-Control: public, max-age=86400`)
7. Write TypeScript types for GeoJSON responses
8. Test with curl/Postman

**Acceptance Criteria**:
- [ ] `/api/geospatial/boundaries?geography=US&level=county` returns ~3,200 features
- [ ] `/api/geospatial/boundaries?geography=CANADA&level=province` returns ~13 features
- [ ] Response includes valid GeoJSON structure (`type: "FeatureCollection"`)
- [ ] Each feature has `id`, `properties`, `geometry` fields
- [ ] Choropleth endpoint joins geospatial + economic data
- [ ] API responses cached for 24 hours
- [ ] Response time <2 seconds for full US counties

**TypeScript Types**:
```typescript
// apps/web/lib/types/geospatial.ts
export interface GeoJSONFeature {
  type: "Feature";
  id: string;
  properties: {
    name: string;
    geography: "US" | "CANADA";
    level: "county" | "province" | "state";
    [key: string]: any;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export interface ChoroplethFeature extends GeoJSONFeature {
  properties: GeoJSONFeature["properties"] & {
    value: number;
    seriesId: number;
    date: string;
  };
}
```

**Dependencies**: CHRONOS-405 (PostGIS tables loaded)
**Estimated Time**: 6-8 hours

---

### Ticket 3: CHRONOS-407 - Install Leaflet Dependencies

**Type**: Technical Task
**Story Points**: 1
**Priority**: High

**Description**:
Install Leaflet, react-leaflet, and TypeScript types. Configure Next.js for client-side only imports (Leaflet uses DOM).

**Tasks**:
1. Install packages: `pnpm add leaflet react-leaflet`
2. Install types: `pnpm add -D @types/leaflet`
3. Import Leaflet CSS in layout or component
4. Configure dynamic import for Next.js SSR compatibility
5. Verify no build errors

**Commands**:
```bash
# Install dependencies
pnpm add leaflet@1.9.4 react-leaflet@4.2.1

# Install TypeScript types
pnpm add -D @types/leaflet@1.9.14

# Verify installation
pnpm nx build web
```

**CSS Import** (in component):
```typescript
import 'leaflet/dist/leaflet.css';
```

**Dynamic Import Pattern** (for Next.js):
```typescript
// pages/analytics/geospatial/page.tsx
import dynamic from 'next/dynamic';

const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
```

**Acceptance Criteria**:
- [ ] `leaflet` and `react-leaflet` in package.json
- [ ] TypeScript types installed
- [ ] Build succeeds without errors
- [ ] No SSR hydration errors in console

**Dependencies**: None
**Estimated Time**: 30 minutes

---

### Ticket 4: CHRONOS-408 - Create GeospatialMap Component (Future-Proof for deck.gl)

**Type**: Feature
**Story Points**: 8
**Priority**: High

**Description**:
Build React component for Leaflet map with choropleth layer. **Architect for future deck.gl migration** by abstracting data fetching and using common prop interface.

**Component Architecture**:
```
apps/web/components/geospatial/
├── GeospatialMap.tsx              # Main container (data fetching)
├── LeafletChoropleth.tsx          # Leaflet-specific rendering (Phase 1)
├── DeckGLChoropleth.tsx           # deck.gl rendering (Phase 2 - placeholder)
├── MapControls.tsx                # Legend, zoom, layer toggles
├── MapTooltip.tsx                 # Hover tooltip
└── types.ts                       # Shared types
```

**GeospatialMap.tsx** (Container - Library Agnostic):
```typescript
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { GeoJSONFeatureCollection, ChoroplethFeature } from '@/lib/types/geospatial';

const LeafletChoropleth = dynamic(() => import('./LeafletChoropleth'), { ssr: false });

interface GeospatialMapProps {
  geography: 'US' | 'CANADA';
  level: 'county' | 'province' | 'state';
  seriesId?: number;
  date?: string;
  height?: string;
}

export default function GeospatialMap({
  geography,
  level,
  seriesId,
  date,
  height = '600px'
}: GeospatialMapProps) {
  const [geoData, setGeoData] = useState<GeoJSONFeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const endpoint = seriesId
        ? `/api/geospatial/choropleth?geography=${geography}&level=${level}&seriesId=${seriesId}&date=${date}`
        : `/api/geospatial/boundaries?geography=${geography}&level=${level}`;

      const res = await fetch(endpoint);
      const data = await res.json();
      setGeoData(data);
      setLoading(false);
    };

    fetchData();
  }, [geography, level, seriesId, date]);

  if (loading) return <div>Loading map...</div>;
  if (!geoData) return <div>No data available</div>;

  // Phase 1: Use Leaflet
  return <LeafletChoropleth geoData={geoData} height={height} />;

  // Phase 2: Switch to deck.gl
  // return <DeckGLChoropleth geoData={geoData} height={height} />;
}
```

**LeafletChoropleth.tsx** (Leaflet Implementation):
```typescript
'use client';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { GeoJSONOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeoJSONFeatureCollection } from '@/lib/types/geospatial';

interface LeafletChoroplethProps {
  geoData: GeoJSONFeatureCollection;
  height: string;
}

export default function LeafletChoropleth({ geoData, height }: LeafletChoroplethProps) {
  // Color scale function
  const getColor = (value?: number) => {
    if (!value) return '#d9d9d9';
    // Quantile scale (customize based on data)
    return value > 10 ? '#800026' :
           value > 8  ? '#BD0026' :
           value > 6  ? '#E31A1C' :
           value > 4  ? '#FC4E2A' :
           value > 2  ? '#FD8D3C' :
                        '#FEB24C';
  };

  // Style each feature
  const style: GeoJSONOptions['style'] = (feature) => ({
    fillColor: getColor(feature?.properties?.value),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  });

  // Hover interaction
  const onEachFeature: GeoJSONOptions['onEachFeature'] = (feature, layer) => {
    layer.on({
      mouseover: () => {
        layer.setStyle({ weight: 3, color: '#666' });
      },
      mouseout: () => {
        layer.setStyle({ weight: 1, color: 'white' });
      }
    });

    // Tooltip
    const name = feature.properties?.name || 'Unknown';
    const value = feature.properties?.value?.toFixed(2) || 'N/A';
    layer.bindTooltip(`<strong>${name}</strong><br/>Value: ${value}`);
  };

  return (
    <MapContainer
      center={[39.8283, -98.5795]} // Center of US
      zoom={4}
      style={{ height, width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <GeoJSON
        data={geoData as any}
        style={style}
        onEachFeature={onEachFeature}
      />
    </MapContainer>
  );
}
```

**Tasks**:
1. Create component directory structure
2. Implement `GeospatialMap.tsx` (container)
3. Implement `LeafletChoropleth.tsx` (Leaflet rendering)
4. Add color scale utility function
5. Implement hover/click interactions
6. Add tooltip component
7. Create placeholder `DeckGLChoropleth.tsx` for Phase 2
8. Write shared TypeScript types
9. Add loading states and error handling
10. Test with sample data

**Acceptance Criteria**:
- [ ] Map renders at 600px height by default
- [ ] OSM tiles load correctly
- [ ] GeoJSON boundaries render as polygons
- [ ] Hover changes polygon style (border thickness)
- [ ] Tooltip shows region name + value
- [ ] Color scale applied to choropleth values
- [ ] Component architecture supports swapping Leaflet → deck.gl
- [ ] No prop drilling (clean interface)
- [ ] Mobile responsive (touch events work)

**Future-Proofing Notes**:
- `GeospatialMap` container is library-agnostic
- Data fetching separated from rendering
- Switching to deck.gl only requires:
  1. Implementing `DeckGLChoropleth.tsx`
  2. Changing one line in `GeospatialMap.tsx`
  3. GeoJSON API stays the same

**Dependencies**: CHRONOS-406 (API), CHRONOS-407 (Leaflet installed)
**Estimated Time**: 10-12 hours

---

### Ticket 5: CHRONOS-409 - Create Geospatial Page Route

**Type**: Feature
**Story Points**: 3
**Priority**: High

**Description**:
Create Next.js page at `/analytics/geospatial` with filter controls for geography, level, and series selection.

**File**: `apps/web/app/(frontend)/analytics/geospatial/page.tsx`

**Page Structure**:
```typescript
import { Suspense } from 'react';
import GeospatialMap from '@/components/geospatial/GeospatialMap';
import FilterSidebar from '@/components/analytics/FilterSidebar';

export const metadata = {
  title: 'Geospatial Analytics - Economic Indicators',
  description: 'Interactive choropleth maps of economic data by region',
};

interface GeospatialPageProps {
  searchParams: Promise<{
    geography?: 'US' | 'CANADA';
    level?: 'county' | 'province' | 'state';
    series?: string;
    date?: string;
  }>;
}

export default async function GeospatialPage({ searchParams }: GeospatialPageProps) {
  const params = await searchParams;
  const geography = params.geography || 'US';
  const level = params.level || 'county';
  const seriesId = params.series ? parseInt(params.series) : undefined;
  const date = params.date;

  return (
    <div className="flex h-screen">
      {/* Filter Sidebar */}
      <aside className="w-80 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Geospatial Filters</h2>
        {/* Reuse FilterSidebar from time-series dashboard */}
        <FilterSidebar
          onGeographyChange={(geo) => {/* update URL */}}
          onLevelChange={(lvl) => {/* update URL */}}
          onSeriesChange={(id) => {/* update URL */}}
        />
      </aside>

      {/* Map Container */}
      <main className="flex-1">
        <Suspense fallback={<div>Loading map...</div>}>
          <GeospatialMap
            geography={geography}
            level={level}
            seriesId={seriesId}
            date={date}
          />
        </Suspense>
      </main>
    </div>
  );
}
```

**Tasks**:
1. Create page file at correct route
2. Add metadata for SEO
3. Implement filter sidebar (reuse from time-series)
4. Add URL state management (useSearchParams)
5. Integrate GeospatialMap component
6. Add loading states
7. Style layout (responsive)
8. Test navigation from main dashboard

**Acceptance Criteria**:
- [ ] Page accessible at `/analytics/geospatial`
- [ ] Filters update URL query params
- [ ] URL params persist on page reload
- [ ] Map updates when filters change
- [ ] Mobile responsive (filters collapse on mobile)
- [ ] Loading states display correctly
- [ ] Link from main dashboard works

**Dependencies**: CHRONOS-408 (GeospatialMap component)
**Estimated Time**: 4-5 hours

---

### Ticket 6: CHRONOS-410 - Add Legend Component

**Type**: Feature
**Story Points**: 3
**Priority**: Medium

**Description**:
Create legend component showing color scale ranges and values. Position in bottom-right corner of map.

**Component**: `apps/web/components/geospatial/MapLegend.tsx`

```typescript
interface MapLegendProps {
  min: number;
  max: number;
  units: string;
  colorScale: (value: number) => string;
}

export default function MapLegend({ min, max, units, colorScale }: MapLegendProps) {
  const grades = [
    { value: min, label: min.toFixed(1) },
    { value: min + (max - min) * 0.2, label: '' },
    { value: min + (max - min) * 0.4, label: '' },
    { value: min + (max - min) * 0.6, label: '' },
    { value: min + (max - min) * 0.8, label: '' },
    { value: max, label: max.toFixed(1) },
  ];

  return (
    <div className="absolute bottom-6 right-6 bg-white p-4 rounded shadow-lg z-[1000]">
      <h4 className="text-sm font-semibold mb-2">Value ({units})</h4>
      <div className="flex flex-col gap-1">
        {grades.map((grade, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-6 h-4 border border-gray-300"
              style={{ backgroundColor: colorScale(grade.value) }}
            />
            <span className="text-xs">{grade.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Tasks**:
1. Create MapLegend component
2. Calculate min/max from data
3. Implement color scale display
4. Position in bottom-right corner
5. Make responsive (hide on small mobile)
6. Add units display
7. Integrate into LeafletChoropleth

**Acceptance Criteria**:
- [ ] Legend displays in bottom-right corner
- [ ] Shows 5-6 color grades
- [ ] Min and max values labeled
- [ ] Units displayed (e.g., "Percent", "Index")
- [ ] Responsive (collapses on mobile <400px)
- [ ] Styles match dashboard design system

**Dependencies**: CHRONOS-408 (Map component)
**Estimated Time**: 3-4 hours

---

### Ticket 7: CHRONOS-411 - Add Navigation Link to Geospatial Dashboard

**Type**: UI Enhancement
**Story Points**: 1
**Priority**: Low

**Description**:
Add link to geospatial dashboard from main navigation and time-series dashboard.

**Files to Update**:
1. `apps/web/components/layout/Navigation.tsx` (main nav)
2. `apps/web/app/(frontend)/analytics/economic/page.tsx` (time-series page)
3. `apps/web/app/(frontend)/page.tsx` (homepage features section)

**Navigation Link**:
```typescript
<Link href="/analytics/geospatial" className="nav-link">
  <MapIcon className="w-5 h-5" />
  Geospatial Analytics
</Link>
```

**Tasks**:
1. Add nav link with map icon
2. Add link from time-series dashboard
3. Update homepage features grid
4. Test navigation flow
5. Update sitemap if applicable

**Acceptance Criteria**:
- [ ] Link appears in main navigation
- [ ] Icon displays correctly (lucide-react MapIcon)
- [ ] Active state when on geospatial page
- [ ] Mobile menu includes link
- [ ] Opens in same tab (not new window)

**Dependencies**: CHRONOS-409 (Page exists)
**Estimated Time**: 1 hour

---

### Ticket 8: CHRONOS-412 - Performance Testing & Optimization

**Type**: Technical Task
**Story Points**: 3
**Priority**: Medium

**Description**:
Test map performance with full US counties (~3,200 polygons). Optimize if needed.

**Performance Targets**:
- Initial page load: <3 seconds
- Map render time: <2 seconds
- Hover response: <100ms
- Pan/zoom: Smooth (30fps minimum)

**Testing Checklist**:
1. Chrome DevTools Lighthouse audit
2. Network tab (check GeoJSON payload size)
3. Performance tab (rendering timeline)
4. Mobile device testing (iPhone SE, Pixel 5)
5. 3G network throttling

**Optimization Strategies**:
- Simplify geometries (reduce polygon vertices)
- Add GeoJSON compression (gzip)
- Implement tile-based loading (load only visible regions)
- Lazy load map component
- Add service worker caching

**Tasks**:
1. Run Lighthouse audit (target: >90 score)
2. Measure GeoJSON payload (target: <2MB gzipped)
3. Test with Chrome DevTools throttling
4. Optimize if metrics fail targets
5. Document performance results

**Acceptance Criteria**:
- [ ] Lighthouse Performance score >85
- [ ] First Contentful Paint <2s
- [ ] Time to Interactive <3s
- [ ] GeoJSON payload <2MB gzipped
- [ ] Smooth pan/zoom on mobile
- [ ] No JavaScript errors in console

**Dependencies**: CHRONOS-409 (Page complete)
**Estimated Time**: 4-5 hours

---

### Ticket 9: CHRONOS-413 - Documentation: Leaflet to deck.gl Migration Guide

**Type**: Documentation
**Story Points**: 2
**Priority**: Low

**Description**:
Document migration path from Leaflet to deck.gl for future Phase 2 work.

**Document**: `docs/10-DEVELOPMENT/03-CODEBASE/GEOSPATIAL_MIGRATION_GUIDE.md`

**Sections**:
1. **Why Migrate**: When to switch to deck.gl (>10K features, GPU heatmaps)
2. **What Changes**: Code changes required
3. **What Stays**: GeoJSON API unchanged
4. **Component Refactor**: `DeckGLChoropleth` implementation
5. **Tile Server Setup**: Maptiler account + API key
6. **Testing Checklist**: Verify feature parity
7. **Rollback Plan**: How to revert if needed

**Migration Checklist**:
```markdown
## Leaflet → deck.gl Migration Checklist

### Pre-Migration
- [ ] Confirm need for GPU features (heatmaps, >10K points)
- [ ] Create Maptiler account (free tier)
- [ ] Test deck.gl in separate branch

### Code Changes
- [ ] Install: `pnpm add @deck.gl/core @deck.gl/react @deck.gl/layers @deck.gl/geo-layers maplibre-gl`
- [ ] Implement `DeckGLChoropleth.tsx`
- [ ] Update `GeospatialMap.tsx` to use DeckGL component
- [ ] Add Maptiler API key to `.env`
- [ ] Update map style URL

### Testing
- [ ] Verify choropleth colors match Leaflet
- [ ] Test hover interactions
- [ ] Check mobile performance
- [ ] Validate legend accuracy
- [ ] Lighthouse audit (compare to Leaflet baseline)

### Deployment
- [ ] Deploy to staging
- [ ] QA approval
- [ ] Monitor bundle size increase
- [ ] Deploy to production
```

**Tasks**:
1. Write migration guide
2. Document deck.gl setup steps
3. Include code examples
4. Add troubleshooting section
5. Link from ADR-009

**Acceptance Criteria**:
- [ ] Document exists at specified path
- [ ] Includes code examples for deck.gl
- [ ] Migration checklist complete
- [ ] Linked from ADR-009

**Dependencies**: None (can start anytime)
**Estimated Time**: 3-4 hours

---

## Sprint Summary

### Total Story Points: **29**
### Estimated Duration: **2-3 weeks**

### Ticket Priorities:
1. **Highest**: CHRONOS-405 (Load PostGIS data) - BLOCKER
2. **High**: CHRONOS-406 (API), CHRONOS-407 (Install), CHRONOS-408 (Component), CHRONOS-409 (Page)
3. **Medium**: CHRONOS-410 (Legend), CHRONOS-412 (Performance)
4. **Low**: CHRONOS-411 (Navigation), CHRONOS-413 (Docs)

### Suggested Work Order:
1. Day 1-2: CHRONOS-405 (Load data) + CHRONOS-407 (Install deps)
2. Day 3-5: CHRONOS-406 (API endpoints)
3. Day 6-10: CHRONOS-408 (Map component)
4. Day 11-12: CHRONOS-409 (Page) + CHRONOS-410 (Legend)
5. Day 13: CHRONOS-411 (Navigation) + CHRONOS-412 (Performance)
6. Day 14-15: CHRONOS-413 (Docs) + Buffer

---

## Sprint Ceremonies (Scrumban Adapted)

### Daily Standup (5 min)
- What did I complete yesterday?
- What am I working on today?
- Any blockers?

### Mid-Sprint Check-in (Day 7)
- Review progress against sprint goal
- Adjust priorities if needed
- Update Jira board

### Sprint Review/Retro (End of Sprint)
- Demo working choropleth map
- What went well?
- What to improve in Phase 2?
- Decide: Continue to deck.gl or iterate on Leaflet?

---

## Definition of Done

A ticket is "Done" when:
- [ ] Code implemented and tested locally
- [ ] No TypeScript errors
- [ ] No console errors/warnings
- [ ] Mobile responsive
- [ ] Committed to git with meaningful message
- [ ] Jira ticket moved to "Done"
- [ ] Screenshot attached to ticket (if UI change)

---

## Future Phase 2 Prep (Not in This Sprint)

These items prepare for deck.gl migration but are NOT required for Phase 1:

- CHRONOS-414: Research Turf.js buffer functions for proximity analysis
- CHRONOS-415: Spike: deck.gl HeatmapLayer POC
- CHRONOS-416: Design graph overlay architecture (Apache AGE + deck.gl)
- CHRONOS-417: Maptiler account setup + style customization

**Decision Point After Phase 1**:
- If users love choropleths → Continue with Leaflet, add more indicators
- If users need heatmaps/animations → Start Phase 2 (deck.gl)

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| GeoJSON payload too large (>5MB) | Medium | High | Simplify geometries, implement tiling |
| Leaflet performance insufficient | Low | Medium | Skip to deck.gl early |
| PostGIS queries slow | Low | Medium | Optimize indexes, add caching |
| Mobile performance poor | Medium | Medium | Reduce polygon complexity, lazy load |
| Tile server (OSM) unreliable | Low | Low | Add fallback tile URL |

---

## Success Metrics

After sprint completion, measure:
- [ ] Page load time (target: <3s)
- [ ] User engagement (time on page, interactions)
- [ ] Error rate (target: <1%)
- [ ] Mobile usage (% of traffic)
- [ ] Feedback via user interviews

---

## Questions for Product Owner

Before starting sprint:
1. Which economic series should be default for choropleth? (Unemployment rate?)
2. Should Canada map center differently than US?
3. Color scale preference (sequential, diverging, or custom)?
4. Do we need print/export functionality?
5. Should legend be toggleable (hide/show)?

---

## Next Steps

1. **Review this sprint plan** - Approve or adjust tickets
2. **Create Jira tickets** - Import these into Jira
3. **Set sprint start date** - Coordinate with your schedule
4. **Start with CHRONOS-405** - Load PostGIS data first
5. **Daily progress updates** - Use TodoWrite tool to track

---

Ready to start? Let me know if you want me to:
1. Create these Jira tickets directly in your Jira instance
2. Adjust any ticket scope or priorities
3. Create the first ticket's implementation code
4. Something else?
