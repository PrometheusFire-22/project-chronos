// apps/web/app/api/geospatial/boundaries/[id]/route.ts
// API endpoint: GET /api/geospatial/boundaries/[id]
// Returns single GeoJSON Feature by ID

import { NextRequest, NextResponse } from 'next/server';
import { getPoolAsync } from '@/lib/db/pool';
import type { GeoJSONFeature } from '@/lib/types/geospatial';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Boundary ID is required' },
        { status: 400 }
      );
    }

    // Get database connection
    const pool = await getPoolAsync();

    // Try to find the boundary in different tables
    // US Counties (geoid format: 5 digits like "06037")
    if (id.length === 5 && /^\d+$/.test(id)) {
      const result = await pool.query(`
        SELECT
          json_build_object(
            'type', 'Feature',
            'id', geoid::text,
            'properties', json_build_object(
              'name', name,
              'id', geoid::text,
              'geography', 'US',
              'level', 'county',
              'statefp', statefp,
              'countyfp', countyfp,
              'aland', aland,
              'awater', awater
            ),
            'geometry', ST_AsGeoJSON(geom)::json
          ) as feature
        FROM geospatial.us_counties
        WHERE geoid = $1
      `, [id]);

      if (result.rows.length > 0) {
        return NextResponse.json(result.rows[0].feature, {
          headers: {
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
            'Content-Type': 'application/json',
          },
        });
      }
    }

    // US States (geoid format: 2 digits like "06")
    if (id.length === 2 && /^\d+$/.test(id)) {
      const result = await pool.query(`
        SELECT
          json_build_object(
            'type', 'Feature',
            'id', geoid::text,
            'properties', json_build_object(
              'name', name,
              'id', geoid::text,
              'geography', 'US',
              'level', 'state'
            ),
            'geometry', ST_AsGeoJSON(geom)::json
          ) as feature
        FROM geospatial.us_states
        WHERE geoid = $1
      `, [id]);

      if (result.rows.length > 0) {
        return NextResponse.json(result.rows[0].feature, {
          headers: {
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
            'Content-Type': 'application/json',
          },
        });
      }
    }

    // Canadian Provinces (pruid format)
    const caProvinceResult = await pool.query(`
      SELECT
        json_build_object(
          'type', 'Feature',
          'id', pruid::text,
          'properties', json_build_object(
            'name', prname,
            'id', pruid::text,
            'geography', 'CANADA',
            'level', 'province',
            'prename', prename,
            'prfname', prfname,
            'preabbr', preabbr,
            'prfabbr', prfabbr,
            'landarea', landarea
          ),
          'geometry', ST_AsGeoJSON(geom)::json
        ) as feature
      FROM geospatial.ca_provinces
      WHERE pruid = $1
    `, [id]);

    if (caProvinceResult.rows.length > 0) {
      return NextResponse.json(caProvinceResult.rows[0].feature, {
        headers: {
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          'Content-Type': 'application/json',
        },
      });
    }

    // Not found in any table
    return NextResponse.json(
      { error: 'Boundary not found', id },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching boundary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boundary', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
