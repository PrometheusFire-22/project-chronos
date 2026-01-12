// apps/web/app/api/geospatial/choropleth/route.ts
// API endpoint: GET /api/geospatial/choropleth
// Returns GeoJSON FeatureCollection with economic data values for choropleth coloring

import { NextRequest, NextResponse } from 'next/server';
import { getPoolAsync } from '@/lib/db/pool';
import type { ChoroplethFeatureCollection } from '@/lib/types/geospatial';
import { demoStateLevelData, demoProvinceLevelData } from './demo-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const geography = searchParams.get('geography')?.toUpperCase();
    const level = searchParams.get('level')?.toLowerCase();
    const seriesId = searchParams.get('seriesId');
    const date = searchParams.get('date');

    // Validate required parameters
    if (!seriesId) {
      return NextResponse.json(
        { error: 'seriesId parameter is required' },
        { status: 400 }
      );
    }

    // Validate geography
    if (geography && !['US', 'CANADA'].includes(geography)) {
      return NextResponse.json(
        { error: 'Invalid geography. Must be US or CANADA' },
        { status: 400 }
      );
    }

    // Get database connection
    const pool = await getPoolAsync();

    // Determine table based on geography and level
    const tableName = getTableName(geography || null, level || null);
    if (!tableName) {
      return NextResponse.json(
        { error: 'Invalid combination of geography and level' },
        { status: 400 }
      );
    }

    // Build and execute choropleth query
    const query = buildChoroplethQuery(tableName, seriesId, date || null);
    const result = await pool.query(query.sql, query.params);

    // Transform to GeoJSON FeatureCollection
    const features = result.rows.map(row => row.feature);

    const featureCollection: ChoroplethFeatureCollection = {
      type: 'FeatureCollection',
      features,
    };

    // Return with caching headers (shorter cache for data with values - 1 hour)
    return NextResponse.json(featureCollection, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching choropleth data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch choropleth data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getTableName(geography: string | null, level: string | null): string | null {
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
        return 'us_counties';
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
        return 'ca_provinces';
    }
  }

  return null;
}

function buildChoroplethQuery(tableName: string, seriesId: string, date: string | null) {
  // Column mappings for different tables
  const columnMappings: Record<string, { id: string; name: string }> = {
    'us_counties': { id: 'geoid', name: 'name' },
    'us_states': { id: 'geoid', name: 'name' },
    'us_cbsa': { id: 'geoid', name: 'name' },
    'us_csa': { id: 'geoid', name: 'name' },
    'us_metdiv': { id: 'geoid', name: 'name' },
    'ca_provinces': { id: 'pruid', name: 'prname' },
    'ca_census_divisions': { id: 'cduid', name: 'cdname' },
  };

  const mapping = columnMappings[tableName] || { id: 'geoid', name: 'name' };
  const geography = tableName.startsWith('us_') ? 'US' : 'CANADA';
  const level = tableName.replace('us_', '').replace('ca_', '');

  // Use demo data for state/province-level visualization
  // TODO: Replace with actual state-level economic series when available
  const demoData = tableName === 'us_states' ? demoStateLevelData :
                   tableName === 'ca_provinces' ? demoProvinceLevelData : {};

  // Build CASE statement for demo values
  const demoValueCases = Object.entries(demoData)
    .map(([fipsCode, value]) => `WHEN g.${mapping.id} = '${fipsCode}' THEN ${value}`)
    .join(' ');

  const sql = `
    SELECT
      json_build_object(
        'type', 'Feature',
        'id', g.${mapping.id}::text,
        'properties', json_build_object(
          'name', g.${mapping.name},
          'id', g.${mapping.id}::text,
          'geography', '${geography}',
          'level', '${level}',
          'value', CASE ${demoValueCases} ELSE null END,
          'seriesId', '${seriesId}',
          'seriesName', 'Unemployment Rate (Demo Data)',
          'units', 'Percent',
          'frequency', 'Monthly',
          'date', CURRENT_DATE::text
        ),
        'geometry', ST_AsGeoJSON(g.geom)::json
      ) as feature
    FROM geospatial.${tableName} g
    ORDER BY g.${mapping.name}
  `;

  return { sql, params: [] };
}
