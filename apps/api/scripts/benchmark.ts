import { pool } from '../src/db/client.js';

async function benchmark() {
    try {
        console.time('Simple Query');
        await pool.query('SELECT 1');
        console.timeEnd('Simple Query');

        console.time('View Query');
        await pool.query('SELECT * FROM analytics.vw_geo_metrics LIMIT 5');
        console.timeEnd('View Query');

        console.time('Geo Union Query (LIMIT 1)');
        const query = `SELECT json_build_object('type', 'FeatureCollection', 'features', json_agg(json_build_object('type', 'Feature', 'properties', json_build_object('name', t.region_name)))) FROM (SELECT name as region_name FROM geospatial.us_states LIMIT 1 UNION ALL SELECT prename as region_name FROM geospatial.ca_provinces LIMIT 1) t;`;
        await pool.query(query);
        console.timeEnd('Geo Union Query (LIMIT 1)');

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

benchmark();
