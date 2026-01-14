// apps/web/app/api/geospatial/boundaries/route.ts
// API endpoint: GET /api/geospatial/boundaries
// Returns GeoJSON FeatureCollection of geospatial boundaries

import { NextRequest, NextResponse } from 'next/server';
import { getPoolAsync } from '@/lib/db/pool';
import type { GeoJSONFeatureCollection, Geography, Level } from '@/lib/types/geospatial';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface GeospatialRow {
  type: string;
  id: string;
  properties: Record<string, any>;
  geometry: any;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const geography = searchParams.get('geography')?.toUpperCase() as Geography | null;
    const level = searchParams.get('level')?.toLowerCase() as Level | null;

    // Validate parameters
    if (geography && !['US', 'CANADA'].includes(geography)) {
      return NextResponse.json(
        { error: 'Invalid geography. Must be US or CANADA' },
        { status: 400 }
      );
    }

    // Determine which table to query based on geography and level
    const tableName = getTableName(geography, level);
    if (!tableName) {
      return NextResponse.json(
        { error: 'Invalid combination of geography and level' },
        { status: 400 }
      );
    }

    // Get database connection
    const pool = await getPoolAsync();

    // Build query based on table
    const query = buildBoundariesQuery(tableName, geography, level);

    // Execute query
    const result = await pool.query(query);
    console.log('Boundaries query result rows:', result.rows.length);

    // Transform to GeoJSON FeatureCollection
    const features = result.rows.map(row => {
      const feature = row.feature;
      return {
        ...feature,
        properties: {
          ...feature.properties,
          geography: geography || getGeographyFromTable(tableName),
          level: level || getLevelFromTable(tableName),
        },
      };
    });

    const featureCollection: GeoJSONFeatureCollection = {
      type: 'FeatureCollection',
      features,
    };

    // Return with caching headers (24 hours)
    return NextResponse.json(featureCollection, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching geospatial boundaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boundaries', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function getTableName(geography: Geography | null, level: Level | null): string | null {
  // US tables
  if (geography === 'US' || (!geography && level && ['county', 'state', 'cbsa', 'csa', 'metdiv'].includes(level))) {
    switch (level) {
      case 'county':
        return 'us_counties';
      case 'state':
        return 'us_states';
      case 'cbsa':
        return 'us_cbsa';
      case 'csa':
        return 'us_csa';
      case 'metdiv':
        return 'us_metdiv';
      default:
        return 'us_counties'; // Default to counties
    }
  }

  // Canada tables
  if (geography === 'CANADA' || level === 'province' || level === 'census_division') {
    switch (level) {
      case 'province':
        return 'ca_provinces';
      case 'census_division':
        return 'ca_census_divisions';
      default:
        return 'ca_provinces'; // Default to provinces
    }
  }

  return null;
}

function getGeographyFromTable(tableName: string): Geography {
  return tableName.startsWith('us_') ? 'US' : 'CANADA';
}

function getLevelFromTable(tableName: string): Level {
  const levelMap: Record<string, Level> = {
    'us_counties': 'county',
    'us_states': 'state',
    'us_cbsa': 'cbsa',
    'us_csa': 'csa',
    'us_metdiv': 'metdiv',
    'ca_provinces': 'province',
    'ca_census_divisions': 'census_division',
  };
  return levelMap[tableName] || 'county';
}

function buildBoundariesQuery(tableName: string, geography: Geography | null, level: Level | null): string {
  // Build the SELECT query with proper column mapping per table
  const columnMappings: Record<string, { id: string; name: string; geom: string }> = {
    'us_counties': { id: 'geoid', name: 'name', geom: 'geom' },
    'us_states': { id: 'geoid', name: 'name', geom: 'geom' },
    'us_cbsa': { id: 'geoid', name: 'name', geom: 'geom' },
    'us_csa': { id: 'geoid', name: 'name', geom: 'geom' },
    'us_metdiv': { id: 'geoid', name: 'name', geom: 'geom' },
    'ca_provinces': { id: 'pruid', name: 'prname', geom: 'geometry' },
    'ca_census_divisions': { id: 'cduid', name: 'cdname', geom: 'geometry' },
  };

  const mapping = columnMappings[tableName] || { id: 'geoid', name: 'name', geom: 'geom' };

  return `
    SELECT
      json_build_object(
        'type', 'Feature',
        'id', ${mapping.id}::text,
        'properties', json_build_object(
          'name', ${mapping.name},
          'id', ${mapping.id}::text
        ),
        'geometry', ST_AsGeoJSON(ST_Simplify(${mapping.geom}, 1.0), 2)::json
      ) as feature
    FROM geospatial.${tableName}    WHERE ST_IsValid(${mapping.geom})    ORDER BY ${mapping.name}
  `;
}
