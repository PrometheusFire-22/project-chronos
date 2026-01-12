# ADR-009: Geospatial Visualization Library Selection

**Date**: 2026-01-11
**Status**: 🔄 Under Review
**Jira**: [CHRONOS-403](https://automatonicai.atlassian.net/browse/CHRONOS-403)
**Decision Makers**: Geoff Bevans (Product Owner), Claude Code (Research & Analysis)

---

## Context

Project Chronos needs to implement interactive geospatial visualizations to complement the existing time-series dashboard. The platform will visualize economic indicators on maps, including:

1. **Temporal Choropleth Maps**: Regional economic volatility over time
2. **Regional Risk Clustering**: Heatmaps of composite financial risk scores
3. **Proximity Analysis**: Economic impact zones around key locations
4. **Graph-Enhanced Spatial**: Investment networks with geographic co-location

### Current Stack
- **Frontend**: Next.js 15.4.10, React 19.2.1
- **Charts**: Recharts (time-series)
- **Deployment**: Cloudflare Pages via OpenNext adapter
- **Database**: PostgreSQL + PostGIS (geospatial data already ingested)

### Key Requirements
- **Performance**: Handle thousands of polygons/points without lag
- **Bundle Size**: Minimize impact on initial page load
- **Cloudflare Costs**: Understand egress and compute implications
- **FOSS Licensing**: No proprietary dependencies (prefer MIT/Apache/BSD)
- **React Integration**: First-class React support
- **Future-Proofing**: Support advanced visualizations (3D, animations, GPU layers)
- **Ease of Use**: Reasonable learning curve for developer

---

## Decision

**Recommended Approach: Progressive Enhancement Strategy**

### Phase 1 (Q1 2026): Start with react-leaflet + Maplibre GL
- **Base Map**: Maplibre GL (vector tiles, WebGL)
- **React Wrapper**: react-leaflet for ease of use
- **Geospatial Utils**: Turf.js (modular imports only)
- **Simple Choropleths**: GeoJSON layers via Leaflet/Maplibre

### Phase 2 (Q2 2026): Upgrade to deck.gl when needed
- **Add deck.gl**: For GPU-accelerated heatmaps and large datasets
- **Keep Maplibre**: Use as basemap provider for deck.gl
- **Layered Approach**: Maplibre for tiles + deck.gl for data layers

### Rationale
This progressive approach:
1. **Minimizes initial risk**: Start with simpler, battle-tested libraries
2. **Validates product-market fit**: Prove demand before investing in complexity
3. **Allows learning**: Build expertise with foundational tools first
4. **Preserves optionality**: Can add deck.gl without rearchitecting
5. **Controls costs**: Lower bundle size initially, expand when revenue justifies it

---

## Library Comparison Analysis

### 1. deck.gl

**Official Site**: [deck.gl](https://deck.gl/)
**GitHub**: [visgl/deck.gl](https://github.com/visgl/deck.gl)

#### Overview
WebGL2-powered visualization framework for large-scale geospatial data. Part of vis.gl ecosystem (OpenJS Foundation).

#### Bundle Size
- **Core (@deck.gl/core)**: ~50KB minified (v8.0+) - [source](https://deck.gl/docs/whats-new)
- **Typical Setup**: 200-500KB gzipped (core + layers + base map integration)
- **Tree-shakeable**: Only bundle layers you use
- **Full Build**: Can exceed 500KB if using many layers

#### License
- **MIT License** ✅ FOSS-compliant - [source](https://github.com/visgl/deck.gl/blob/master/LICENSE)

#### React Integration
- **Excellent**: Official `@deck.gl/react` bindings
- **Next.js Compatible**: Fully ES module compliant, SSR-friendly (though WebGL2 renders client-side only)
- **React 19 Compatible**: ✅ Latest version supports React 19

#### Performance
- **GPU-Accelerated**: WebGL2/WebGPU rendering
- **Large Datasets**: Handles millions of points efficiently
- **Animations**: GPU-based, smooth at 60fps
- **Default Setting**: `powerPreference: 'high-performance'` for GPU optimization - [source](https://deck.gl/docs/get-started/using-with-react)

#### Layer Types (40+ available)
- ✅ **ChoroplethLayer**: For regional maps
- ✅ **HeatmapLayer**: For risk density visualization
- ✅ **ScatterplotLayer**: For point data
- ✅ **ArcLayer**: For connection/flow visualization
- ✅ **GraphLayer**: For network relationships
- ✅ **HexagonLayer**: For spatial aggregation
- ✅ **TripsLayer**: For temporal animations

#### Ease of Use
- **Learning Curve**: Moderate to steep
- **Documentation**: Excellent (comprehensive API docs, examples)
- **TypeScript Support**: ✅ Full type definitions
- **Community**: Large, active (20K+ GitHub stars)

#### Pros
✅ Future-proof: Supports advanced 3D, animations, GPU acceleration
✅ High performance: Best for large datasets (>10K features)
✅ Comprehensive: 40+ layer types cover most use cases
✅ Well-maintained: OpenJS Foundation backing, active development
✅ Interoperable: Works with Mapbox/Maplibre basemaps

#### Cons
❌ Complexity: Steeper learning curve than Leaflet
❌ Bundle Size: Larger initial payload (200-500KB vs 40KB)
❌ Overkill for Simple Maps: More than needed for basic choropleths
❌ WebGL Dependency: Doesn't degrade gracefully on older browsers

#### Cost Implications (Cloudflare Pages)
- **Egress**: ✅ **ZERO** additional costs - Cloudflare Pages has no egress charges - [source](https://developers.cloudflare.com/r2/pricing/)
- **Compute**: ✅ **Client-side rendering** - WebGL executes in browser, no server GPU costs
- **Bundle Size**: ~0.2-0.5MB added to initial page load (minimal CF bandwidth impact)
- **Browser Rendering API**: Not needed (that's for headless browsers at $0.09/hour) - [source](https://developers.cloudflare.com/browser-rendering/pricing/)

#### Best For
- Large datasets (>10,000 features)
- GPU-accelerated heatmaps and animations
- 3D visualizations
- Complex layered visualizations
- When performance is critical

---

### 2. Leaflet + react-leaflet

**Official Site**: [Leaflet](https://leafletjs.com/)
**React Wrapper**: [react-leaflet](https://react-leaflet.js.org/)

#### Overview
Lightweight, mobile-friendly JavaScript library for interactive maps. Industry standard since 2011.

#### Bundle Size
- **Core**: ~39KB gzipped + 4KB CSS - [source](https://github.com/maplibre/maplibre-gl-js/issues/59)
- **react-leaflet**: Adds ~10KB
- **Total**: ~50KB (smallest option by far)

#### License
- **BSD 2-Clause License** ✅ FOSS-compliant

#### React Integration
- **Good**: react-leaflet provides React hooks and components
- **Next.js**: Requires dynamic imports (client-side only due to DOM manipulation)
- **React 19**: ✅ Compatible with latest React

#### Performance
- **DOM-Based Rendering**: Uses HTML/CSS/SVG (not WebGL)
- **Limitations**: Starts lagging with >1,000 interactive elements
- **Best Use**: Up to a few hundred features with interactivity

#### Ease of Use
- **Learning Curve**: Easiest of all options
- **Documentation**: Excellent, 13+ years of community resources
- **Plugin Ecosystem**: Massive (hundreds of plugins available)
- **Developer Experience**: Straightforward API, quick to get started - [source](https://blog.logrocket.com/react-map-library-comparison/)

#### Pros
✅ Smallest bundle size: ~50KB total
✅ Easiest to learn: Straightforward API
✅ Mature ecosystem: 13+ years, battle-tested
✅ Zero dependencies: Standalone library
✅ Great for simple maps: Perfect for basic choropleths
✅ Excellent documentation: Huge community support

#### Cons
❌ Performance ceiling: DOM-based, struggles with large datasets
❌ No GPU acceleration: Can't compete with WebGL for complex visuals
❌ Limited animations: Not suitable for smooth temporal animations
❌ Basic styling: Less sophisticated than vector tile approaches

#### Cost Implications (Cloudflare Pages)
- **Egress**: ✅ ZERO (same as deck.gl)
- **Compute**: ✅ Client-side DOM manipulation only
- **Bundle Size**: ~50KB (minimal impact)

#### Best For
- Simple choropleth maps (<500 features)
- Getting started quickly (MVP)
- Projects prioritizing bundle size
- Teams without WebGL expertise
- Basic interactivity (hover, click, popup)

---

### 3. Maplibre GL + react-map-gl

**Official Site**: [Maplibre GL](https://maplibre.org/maplibre-gl-js/docs/)
**React Wrapper**: [react-map-gl](https://visgl.github.io/react-map-gl/)

#### Overview
Open-source fork of Mapbox GL JS. WebGL-based vector tile rendering. Industry standard for modern web mapping.

#### Bundle Size
- **Core**: ~220KB gzipped - [source](https://github.com/maplibre/maplibre-gl-js/issues/59)
- **react-map-gl**: ~212KB - [source](https://blog.logrocket.com/react-map-library-comparison/)
- **Total**: ~220KB (middle ground)

#### License
- **3-Clause BSD License** ✅ FOSS-compliant (open-source fork created to avoid Mapbox proprietary license)

#### React Integration
- **Excellent**: react-map-gl is maintained by vis.gl team (same as deck.gl)
- **Next.js**: Full support with SSR considerations
- **React 19**: ✅ Compatible

#### Performance
- **WebGL-Accelerated**: GPU rendering for smooth performance
- **Vector Tiles**: Efficient, scalable, dynamic styling
- **Sweet Spot**: Thousands to tens of thousands of features
- **Smooth Animations**: 60fps panning/zooming - [source](https://blog.jawg.io/maplibre-gl-vs-leaflet-choosing-the-right-tool-for-your-interactive-map/)

#### Ease of Use
- **Learning Curve**: Moderate (WebGL concepts required)
- **Documentation**: Good, growing community
- **Styling**: Style spec similar to Mapbox (JSON-based)
- **TypeScript**: ✅ Full type definitions

#### Pros
✅ Modern architecture: WebGL-based, vector tiles
✅ Good performance: Handles thousands of features smoothly
✅ Smooth animations: GPU-accelerated panning/zooming
✅ Styling flexibility: Dynamic, runtime styling changes
✅ Growing momentum: Clear growth trend from mid-2024 onward - [source](https://www.geoapify.com/map-libraries-comparison-leaflet-vs-maplibre-gl-vs-openlayers-trends-and-statistics/)
✅ Interoperable: Works with deck.gl layers

#### Cons
❌ Larger bundle: ~220KB (5x larger than Leaflet)
❌ Tile server needed: Requires vector tile source (OSM, Maptiler, etc.)
❌ Steeper learning curve: More complex than Leaflet
❌ Not ideal for heatmaps: Better with deck.gl overlay for GPU heatmaps

#### Cost Implications (Cloudflare Pages)
- **Egress**: ✅ ZERO (same as others)
- **Compute**: ✅ Client-side WebGL
- **Tile Server**: May incur costs depending on tile provider (Maptiler free tier: 100K loads/month)

#### Best For
- Modern, performant base maps
- Projects needing smooth pan/zoom
- Vector tiles with dynamic styling
- Integration with deck.gl data layers
- Medium to large feature counts (1K-50K)

---

### 4. Turf.js (Geospatial Analysis Utility)

**Official Site**: [Turf.js](https://turfjs.org/)
**GitHub**: [Turfjs/turf](https://github.com/Turfjs/turf)

#### Overview
Modular geospatial analysis library for JavaScript. Performs calculations on GeoJSON data (distance, buffer, intersection, etc.).

#### Bundle Size
- **Full Build**: ~500KB - [source](https://omurbilgili.medium.com/turf-js-a-javascript-library-for-geospatial-analysis-54ae15ecb9bf)
- **Modular Imports**: ~10-50KB per function
- **Strategy**: Import only needed functions (e.g., `@turf/buffer`, `@turf/distance`)

#### License
- **MIT License** ✅ FOSS-compliant

#### Key Functions
- ✅ **Distance calculations**: `@turf/distance` (great circle distance)
- ✅ **Buffer creation**: `@turf/buffer` (proximity zones)
- ✅ **Intersection**: `@turf/intersect` (polygon overlaps)
- ✅ **Area measurement**: `@turf/area`
- ✅ **Centroid**: `@turf/centroid` (polygon centers)
- ✅ **Booleans**: `@turf/boolean-within`, `@turf/boolean-intersects`

#### Use Cases in Project Chronos
1. **Proximity Analysis**: Calculate 30-mile buffer zones around Federal Reserve banks
2. **Risk Clustering**: Aggregate data points within geographic regions
3. **Spatial Joins**: Match company locations to MSA boundaries
4. **Distance Queries**: Find series within X miles of a point

#### Pros
✅ Modular: Only import functions you need
✅ Client-side: All calculations in browser (no server needed)
✅ GeoJSON native: Works seamlessly with PostGIS output
✅ TypeScript: Full type definitions

#### Cons
❌ Large if imported fully: 500KB for complete library
❌ Client compute: Complex operations can be slow in browser

#### Recommendation
**Import modularly** - Add specific functions as needed:
```typescript
import buffer from '@turf/buffer';
import distance from '@turf/distance';
// Bundle impact: ~20KB instead of 500KB
```

---

### 5. D3-geo (Alternative for Static Choropleths)

**Official Site**: [D3-geo](https://github.com/d3/d3-geo)

#### Overview
SVG-based map projections and geographic utilities. Part of D3.js ecosystem.

#### Bundle Size
- **d3-geo**: ~50KB
- **With D3 scales/transitions**: Can grow to 100-200KB

#### License
- **ISC License** ✅ FOSS-compliant

#### Pros
✅ Excellent for static choropleths
✅ Custom projections (Albers, Mercator, etc.)
✅ SVG-based (DOM manipulation, good for print)

#### Cons
❌ Complex API: Steeper learning curve than Leaflet
❌ No interactivity out of box: Need to build zoom/pan manually
❌ Performance: SVG struggles with >500 features

#### Recommendation
**Not recommended** - Better served by Leaflet (simpler) or deck.gl (more powerful).

---

## Detailed Cost Analysis (Cloudflare Pages)

### Good News: WebGL Rendering is FREE on Cloudflare

**Key Findings from Research:**

1. **No Egress Charges**
   - Cloudflare Pages: FREE data transfer (egress) - [source](https://developers.cloudflare.com/pages/functions/pricing/)
   - R2 Storage: FREE egress via Workers API - [source](https://developers.cloudflare.com/r2/pricing/)
   - **Impact**: Bundle size only affects user experience (load time), not costs

2. **Client-Side WebGL = Zero Server GPU Costs**
   - deck.gl/Maplibre GL render in **user's browser**
   - No server-side GPU resources consumed
   - Cloudflare Pages serves static assets + serverless functions only

3. **Browser Rendering API is NOT Needed**
   - That API ($0.09/browser hour) is for **headless browsers** (Puppeteer/Playwright)
   - Interactive WebGL maps don't use this service
   - [source](https://developers.cloudflare.com/changelog/2025-07-28-br-pricing/)

4. **Workers/Pages Requests**
   - Free tier: 100,000 requests/day
   - Paid: $5/month for 10M requests
   - **Impact**: Geospatial visualizations are client-side; minimal request impact

### Bundle Size Trade-offs

| Library | Bundle Size | Initial Load Impact | Recurring Cost |
|---------|-------------|---------------------|----------------|
| Leaflet | ~50KB | +50ms (3G) | $0 |
| Maplibre GL | ~220KB | +220ms (3G) | $0 |
| deck.gl (minimal) | ~250KB | +250ms (3G) | $0 |
| deck.gl (full) | ~500KB | +500ms (3G) | $0 |

**Verdict**: Bundle size impacts user experience but NOT costs. Choose based on functionality needs, not cost.

---

## Comparison Matrix

| Criteria | deck.gl | Maplibre GL | Leaflet | Turf.js |
|----------|---------|-------------|---------|---------|
| **Bundle Size** | 🟡 250-500KB | 🟡 220KB | 🟢 50KB | 🟡 50-500KB (modular) |
| **Performance (Large Datasets)** | 🟢 Excellent | 🟢 Good | 🔴 Poor | N/A |
| **Ease of Use** | 🟡 Moderate | 🟡 Moderate | 🟢 Easy | 🟢 Easy |
| **React Integration** | 🟢 Excellent | 🟢 Excellent | 🟢 Good | 🟢 Universal |
| **Learning Curve** | 🟡 Steep | 🟡 Moderate | 🟢 Gentle | 🟢 Gentle |
| **Future-Proofing** | 🟢 Excellent | 🟢 Good | 🟡 Limited | 🟢 Timeless |
| **FOSS License** | 🟢 MIT | 🟢 BSD-3 | 🟢 BSD-2 | 🟢 MIT |
| **Cloudflare Cost** | 🟢 $0 | 🟢 $0 | 🟢 $0 | 🟢 $0 |
| **Animations** | 🟢 Excellent | 🟢 Good | 🔴 Limited | N/A |
| **3D Support** | 🟢 Yes | 🟡 Limited | 🔴 No | N/A |
| **Heatmaps (GPU)** | 🟢 Native | 🟡 Via deck.gl | 🔴 No | N/A |
| **Community** | 🟢 20K+ stars | 🟢 Growing fast | 🟢 Massive | 🟢 Large |
| **TypeScript** | 🟢 Full | 🟢 Full | 🟢 Full | 🟢 Full |
| **Choropleth Maps** | 🟢 Yes | 🟢 Yes | 🟢 Yes | N/A |

---

## Recommended Implementation Plan

### Phase 1: MVP with Leaflet (Weeks 1-4, Q1 2026)

**Goal**: Ship first choropleth map quickly to validate demand

**Stack**:
- **Base Map**: Leaflet with OSM tiles
- **React**: react-leaflet
- **GeoJSON**: Serve from PostGIS via API
- **Styling**: Simple quantile-based color scales
- **Utils**: Turf.js (only `@turf/centroid` for labels)

**Implementation**:
```typescript
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// ~60KB bundle addition
```

**Rationale**:
- ✅ Fastest time to market (1-2 weeks)
- ✅ Smallest bundle impact
- ✅ Validates product-market fit before investing in complexity
- ✅ Reduces risk of over-engineering

**Success Criteria**:
- Users can view US/Canada choropleth maps
- <500 county polygons render smoothly
- Mobile-responsive

---

### Phase 2: Upgrade to Maplibre GL (Weeks 5-8, Q1 2026)

**Goal**: Improve performance and enable smooth animations

**Stack**:
- **Base Map**: Maplibre GL (vector tiles)
- **React**: react-map-gl
- **Tiles**: Maptiler or OpenMapTiles (free tier: 100K loads/month)
- **Styling**: JSON-based style spec
- **Turf.js**: Add `@turf/buffer` for proximity analysis

**Implementation**:
```typescript
import Map from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';

// ~230KB bundle addition
```

**Rationale**:
- ✅ Better performance for 1K-10K features
- ✅ Smooth pan/zoom animations
- ✅ Professional vector tile aesthetics
- ✅ Prepares architecture for deck.gl integration

**Success Criteria**:
- Smooth 60fps panning/zooming
- Temporal animations (sliding time window)
- Dynamic choropleth styling

---

### Phase 3: Add deck.gl for Advanced Visualizations (Weeks 9-12, Q2 2026)

**Goal**: Unlock GPU-accelerated heatmaps and large datasets

**Stack**:
- **Base Map**: Maplibre GL (keep for tiles)
- **Data Layers**: deck.gl (GPU-accelerated)
- **React**: `@deck.gl/react` + react-map-gl interleaved
- **Layers**: HeatmapLayer, ArcLayer, ScatterplotLayer
- **Turf.js**: Full suite for proximity analysis

**Implementation**:
```typescript
import { DeckGL } from '@deck.gl/react';
import { HeatmapLayer, ScatterplotLayer } from '@deck.gl/layers';
import Map from 'react-map-gl/maplibre';

// ~500KB bundle addition (one-time)
```

**Rationale**:
- ✅ Unlock regional risk heatmaps (GPU-accelerated)
- ✅ Handle >10K data points smoothly
- ✅ Enable temporal animations (TripsLayer)
- ✅ Support future 3D visualizations

**Success Criteria**:
- Heatmap renders 10K+ points at 60fps
- Smooth temporal transitions
- Arc layers for connection flows

---

### Phase 4: Graph Integration (Q2 2026, Optional)

**Goal**: Overlay Apache AGE graph data on maps

**Stack**:
- **deck.gl GraphLayer** or **D3-force with deck.gl ScatterplotLayer**
- **Apache AGE**: Query investment networks
- **Spatial Join**: Match graph nodes to geographic regions

**Rationale**:
- ✅ Visualize investment networks geographically
- ✅ Identify geographic clustering of PE firms
- ✅ Combine temporal, spatial, and graph modalities

---

## Alternatives Considered

### Option A: Jump Straight to deck.gl

**Rejected Because**:
- 🔴 Higher complexity upfront (delays MVP)
- 🔴 Larger bundle size before validating demand
- 🔴 Steeper learning curve for team
- 🔴 Over-engineering if simple choropleths suffice

### Option B: Use Mapbox GL JS (Proprietary)

**Rejected Because**:
- 🔴 Not FOSS (proprietary license since v2.0)
- 🔴 Licensing costs at scale ($5/1K monthly active users)
- 🔴 Vendor lock-in risks
- ✅ Maplibre GL is open-source fork with same features

### Option C: Build Custom WebGL Solution

**Rejected Because**:
- 🔴 Massive engineering investment (months)
- 🔴 Reinventing the wheel
- 🔴 No community support
- 🔴 Higher maintenance burden

### Option D: Use Google Maps API

**Rejected Because**:
- 🔴 Proprietary, expensive at scale
- 🔴 Limited customization
- 🔴 Vendor lock-in

---

## Validation & Testing Plan

### Bundle Size Testing

```bash
# Measure actual bundle impact
pnpm nx build web --analyze

# Compare before/after
ls -lh apps/web/.next/static/chunks/*.js | grep -E '(leaflet|maplibre|deck)'
```

**Acceptance Criteria**:
- Phase 1 (Leaflet): <100KB addition
- Phase 2 (Maplibre): <250KB addition
- Phase 3 (deck.gl): <600KB addition

### Performance Testing

```typescript
// Measure rendering time
const start = performance.now();
map.addLayer(choroplethLayer);
const renderTime = performance.now() - start;
console.log(`Rendered ${featureCount} features in ${renderTime}ms`);
```

**Acceptance Criteria**:
- <100ms render time for 500 features (Phase 1)
- <200ms render time for 5,000 features (Phase 2)
- <500ms render time for 50,000 features (Phase 3)

### Mobile Performance

Test on:
- iPhone SE (low-end mobile)
- Samsung Galaxy S10 (mid-range)
- Desktop Chrome (baseline)

**Acceptance Criteria**:
- Smooth 30fps minimum on mobile
- No lag on pan/zoom
- Responsive controls (<100ms touch response)

---

## Consequences

### Positive

✅ **Cost-Effective**: Zero Cloudflare egress/compute costs for all options
✅ **Progressive Enhancement**: Start simple, add complexity as needed
✅ **Risk Mitigation**: Validate demand before investing in deck.gl
✅ **FOSS Compliant**: All libraries use permissive licenses
✅ **Future-Proof**: Architecture supports deck.gl upgrade without rewrite
✅ **Performance Flexibility**: Can choose optimal library per use case

### Negative

⚠️ **Multiple Libraries**: Learning curve for team across 3 libraries
⚠️ **Bundle Size Growth**: From 50KB → 600KB across phases
⚠️ **Migration Effort**: Phase 1 → Phase 2 requires refactoring components
⚠️ **Tile Server Dependency**: Maplibre requires external tile provider (cost TBD)
⚠️ **Complexity Creep**: deck.gl brings significant API surface area

### Neutral

📋 **Learning Investment**: Team needs to learn WebGL concepts for Phase 2+
📋 **Maintenance**: Three libraries to keep updated (vs. one monolithic solution)
📋 **Documentation**: Need to document rationale for which library when

---

## Monitoring & Success Metrics

### Bundle Size Tracking

```bash
# Run on every build
pnpm nx build web --analyze

# Alert if bundle grows >10% unexpectedly
```

### Performance Monitoring

Use Sentry (already configured) to track:
- Page load time (LCP metric)
- First Contentful Paint (FCP)
- Time to Interactive (TTI)
- JavaScript execution time

### User Engagement

Track via analytics:
- Map interactions (pan, zoom, hover)
- Feature usage (choropleth vs heatmap vs graph)
- Time spent on geospatial pages
- Mobile vs desktop usage split

---

## Security Considerations

1. **GeoJSON Injection**: Validate GeoJSON from user input (if accepting uploads)
2. **Tile Server**: Use HTTPS for tile requests (prevent MITM)
3. **API Rate Limiting**: Protect PostGIS endpoints from abuse
4. **Content Security Policy**: Allow WebGL contexts (`script-src 'unsafe-eval'` required)

---

## Migration Path

### If deck.gl Proves Unnecessary

Scenario: Simple choropleths are sufficient, GPU heatmaps not needed.

**Action**: Stay on Leaflet/Maplibre indefinitely
**Cost**: Zero sunk cost (both are production-ready)
**Timeline**: No migration needed

### If deck.gl Performance Critical Earlier

Scenario: Early user feedback demands advanced visualizations sooner.

**Action**: Accelerate Phase 3 timeline
**Risk**: Higher bundle size before full validation
**Mitigation**: Code splitting, lazy loading deck.gl routes

---

## Open Questions

1. **Tile Server Choice**: Maptiler vs OpenMapTiles vs self-hosted?
   - **Recommendation**: Start with Maptiler free tier (100K loads/month)
   - **Cost**: $0-49/month depending on traffic

2. **Offline Support**: Should maps work offline?
   - **Recommendation**: No for MVP (complexity not justified)
   - **Future**: Consider service workers + tile caching

3. **Custom Basemap Styling**: Dark mode, branded colors?
   - **Recommendation**: Phase 2 (Maplibre JSON style spec)

4. **Mobile-First or Desktop-First**: Design priority?
   - **Recommendation**: Mobile-first (responsive design, touch-optimized)

---

## Lessons Learned from Time-Series Dashboard

1. **Start Small**: Recharts served us well; didn't need D3 complexity upfront
2. **Cloudflare is Generous**: Zero egress costs are massive win
3. **Bundle Size Matters**: Mobile users feel every KB
4. **TypeScript is Essential**: Type safety caught many errors
5. **Progressive Enhancement Works**: Can always upgrade later

---

## References

### Official Documentation
- [deck.gl Docs](https://deck.gl/)
- [Leaflet Docs](https://leafletjs.com/)
- [Maplibre GL Docs](https://maplibre.org/maplibre-gl-js/docs/)
- [Turf.js Docs](https://turfjs.org/)
- [react-map-gl Docs](https://visgl.github.io/react-map-gl/)

### Research Sources
- [Using deck.gl with React](https://deck.gl/docs/get-started/using-with-react)
- [deck.gl Performance Optimization](https://deck.gl/docs/developer-guide/performance)
- [Maplibre vs Leaflet Comparison](https://blog.jawg.io/maplibre-gl-vs-leaflet-choosing-the-right-tool-for-your-interactive-map/)
- [React Map Library Comparison](https://blog.logrocket.com/react-map-library-comparison/)
- [Map Libraries Popularity Trends](https://www.geoapify.com/map-libraries-comparison-leaflet-vs-maplibre-gl-vs-openlayers-trends-and-statistics/)
- [Cloudflare Pages Pricing](https://developers.cloudflare.com/pages/functions/pricing/)
- [Cloudflare R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Turf.js Guide](https://omurbilgili.medium.com/turf-js-a-javascript-library-for-geospatial-analysis-54ae15ecb9bf)
- [deck.gl License](https://github.com/visgl/deck.gl/blob/master/LICENSE)

### Jira Tickets
- [CHRONOS-403: Information Architecture for Multiple Viz Types](https://automatonicai.atlassian.net/browse/CHRONOS-403)

---

## Approval

- 🔄 **Under Review**: Awaiting Product Owner approval
- ⏳ **Technical Validation**: Needs POC implementation
- ⏳ **Cost Review**: Tile server costs TBD
- ⏳ **Team Buy-In**: Needs developer consensus

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-01-11 | Initial research and ADR draft | Claude Code |
| 2026-01-11 | Added progressive enhancement strategy | Claude Code |
| 2026-01-11 | Clarified Cloudflare cost implications (zero for WebGL) | Claude Code |

---

## Next Steps

1. **Approve ADR**: Product Owner review and sign-off
2. **Spike Phase 1**: 2-day POC with Leaflet + react-leaflet
3. **Design GeoJSON API**: Endpoint for serving PostGIS boundaries
4. **Create Jira Tickets**: Break down Phase 1 into actionable tasks
5. **Update Roadmap**: Add geospatial milestones to CHRONOS-403
