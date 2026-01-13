// apps/web/lib/types/geospatial.ts
// TypeScript types for geospatial data structures

export type Geography = "US" | "CANADA";
export type Level = "county" | "province" | "state" | "cbsa" | "csa" | "metdiv" | "census_division";

export interface GeoJSONFeature {
  type: "Feature";
  id: string;
  properties: {
    name: string;
    geography: Geography;
    level: Level;
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
    value: number | null;
    category: string;
    seriesName: string;
    units: string;
    date: string;
  };
}

export interface ChoroplethFeatureCollection {
  type: "FeatureCollection";
  features: ChoroplethFeature[];
}

// Query parameter types for API endpoints
export interface BoundariesQueryParams {
  geography?: Geography;
  level?: Level;
}

export interface ChoroplethQueryParams extends BoundariesQueryParams {
  category?: string;
  date?: string;
}
