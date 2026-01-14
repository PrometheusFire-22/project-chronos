// apps/web/app/api/geospatial/choropleth/route.ts
// API endpoint: GET /api/geospatial/choropleth
// Returns JSON object with geographic IDs mapped to economic data values for choropleth coloring

import { NextRequest, NextResponse } from 'next/server';
import { getPoolAsync } from '@/lib/db/pool';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const geography = searchParams.get('geography')?.toUpperCase();
    const level = searchParams.get('level')?.toLowerCase();
    const category = searchParams.get('category');
    const date = searchParams.get('date');
    const debug = searchParams.get('debug') === 'true';

    // Validate required parameters
    if (!category) {
      return NextResponse.json(
        { error: 'category parameter is required' },
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
    console.log('DB connection established');

    // Determine table based on geography and level
    const tableName = getTableName(geography || null, level || null);
    console.log('Table name:', tableName);
    if (!tableName) {
      return NextResponse.json(
        { error: 'Invalid combination of geography and level' },
        { status: 400 }
      );
    }

    // Build and execute choropleth query
    const query = buildChoroplethQuery(tableName, category, date || null);
    console.log('Query:', query.sql, query.params);
    const result = await pool.query(query.sql, query.params);
    console.log('Query result rows:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('Sample result:', result.rows[0]);
    }

    if (debug) {
      // Return raw debug data
      return NextResponse.json({
        query: query.sql,
        params: query.params,
        rows: result.rows
      });
    }

    // Transform to ID -> value mapping
    const data: Record<string, number | null> = {};
    result.rows.forEach(row => {
      data[row.geography_id] = row.value;
    });

    // Return with caching headers (shorter cache for data with values - 1 hour)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=0, stale-while-revalidate=60',
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

function buildChoroplethQuery(tableName: string, category: string, date: string | null) {
  // Column mappings for different tables
  const columnMappings: Record<string, { id: string; name: string; geoType: string; geom: string }> = {
    'us_counties': { id: 'geoid', name: 'name', geoType: 'County', geom: 'geom' },
    'us_states': { id: 'geoid', name: 'name', geoType: 'State', geom: 'geom' },
    'us_cbsa': { id: 'geoid', name: 'name', geoType: 'CBSA', geom: 'geom' },
    'us_csa': { id: 'geoid', name: 'name', geoType: 'CSA', geom: 'geom' },
    'us_metdiv': { id: 'geoid', name: 'name', geoType: 'MetDiv', geom: 'geom' },
    'ca_provinces': { id: 'pruid', name: 'prname', geoType: 'Province', geom: 'geometry' },
    'ca_census_divisions': { id: 'cduid', name: 'cdname', geoType: 'Census Division', geom: 'geometry' },
  };

  const mapping = columnMappings[tableName] || { id: 'geoid', name: 'name', geoType: 'State' };

  // Query real economic data by joining:
  // 1. Geospatial boundary table with series_metadata via geography_id
  // 2. Get latest observation (or observation at specific date) from economic_observations
  // 3. Return geography_id -> value mapping

  const sql = `
    WITH latest_observations AS (
      SELECT DISTINCT ON (series_id)
        series_id,
        observation_date,
        value
      FROM timeseries.economic_observations
      WHERE series_id IN (
        SELECT series_id
        FROM metadata.series_metadata
        WHERE geography_type = $1
        AND category = $2
      )
      ${date ? 'AND observation_date <= $3' : ''}
      ORDER BY series_id, observation_date DESC
    ),
    series_with_geography AS (
      SELECT
        sm.series_id,
        sm.geography_id,
        sm.series_name,
        sm.frequency,
        sm.category,
        lo.value,
        lo.observation_date
      FROM metadata.series_metadata sm
      JOIN latest_observations lo ON sm.series_id = lo.series_id
      WHERE sm.geography_type = $1
      AND sm.category = $2
    )
    SELECT
      TRIM(g.${mapping.id}::text) as geography_id,
      swg.value
    FROM geospatial.${tableName} g
    LEFT JOIN series_with_geography swg ON TRIM(g.${mapping.id}::text) = TRIM(swg.geography_id::text)
    ORDER BY g.${mapping.name}
  `;

  const params = date ? [mapping.geoType, category, date] : [mapping.geoType, category];
  return { sql, params };
}
