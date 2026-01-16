import { pool } from '../src/db/client.js';

async function createOptimizedView() {
    try {
        console.log('--- Creating Optimized Geometry View ---');
        
        // This view pre-simplifies and standardizes the geometry for US and Canada
        // It solves the "Union" issue by doing it once in the DB definition
        const query = `
        CREATE OR REPLACE VIEW analytics.vw_choropleth_boundaries AS
        SELECT 
            name as region_name,
            'US' as country_code,
            ST_Simplify(geom::geometry, 0.05) as geometry -- Pre-simplify for performance
        FROM geospatial.us_states
        UNION ALL
        SELECT 
            prename as region_name,
            'CA' as country_code,
            ST_Simplify(geometry::geometry, 0.05) as geometry
        FROM geospatial.ca_provinces;
        `;
        
        await pool.query(query);
        console.log('View "analytics.vw_choropleth_boundaries" created successfully.');

        console.log('--- Testing View Access ---');
        const res = await pool.query(`
            SELECT region_name, country_code, ST_AsGeoJSON(geometry) as geojson 
            FROM analytics.vw_choropleth_boundaries 
            LIMIT 5
        `);
        console.table(res.rows.map(r => ({ ...r, geojson: r.geojson.substring(0, 50) + '...' })));

    } catch (e) {
        console.error('Failed to create view:', e);
    } finally {
        await pool.end();
    }
}

createOptimizedView();
