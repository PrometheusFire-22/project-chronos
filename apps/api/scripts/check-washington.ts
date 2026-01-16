import { pool } from '../src/db/client.js';

async function investigateWashington() {
    try {
        console.log('--- Checking Washington State Geometry Name ---');
        // Check finding 'Washington'
        const res1 = await pool.query("SELECT name FROM geospatial.us_states WHERE name ILIKE '%Washington%'");
        console.table(res1.rows);

        console.log('\n--- Checking Unemployment Data for Washington ---');
        // Check finding 'Washington' data in Series Metadata
        const res2 = await pool.query(`
            SELECT series_id, series_name, geography 
            FROM metadata.series_metadata 
            WHERE geography ILIKE '%Washington%' 
            AND series_name ILIKE '%Unemployment Rate%'
        `);
        console.table(res2.rows);

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

investigateWashington();
