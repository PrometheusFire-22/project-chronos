import { pool } from '../src/db/client.js';

async function verifyGeoNames() {
    try {
        console.log('--- US States in View ---');
        // Check finding 'Washington'
        const res1 = await pool.query("SELECT region_name FROM analytics.vw_choropleth_boundaries WHERE region_name ILIKE '%Washington%'");
        console.table(res1.rows);

        console.log('\n--- Metadata in View for Washington ---');
        // Check if data is actually linked in the heavy view
        const targetDate = '2025-11-01'; 
        const res2 = await pool.query(`
            SELECT geography, value, observation_date 
            FROM analytics.vw_geo_metrics 
            WHERE geography ILIKE '%Washington%' 
            AND metric_type = 'unemployment'
            ORDER BY observation_date DESC LIMIT 5
        `);
        console.table(res2.rows);

        console.log('\n--- Join Test ---');
        const res3 = await pool.query(`
            SELECT b.region_name, vm.value
            FROM analytics.vw_choropleth_boundaries b
            JOIN analytics.vw_geo_metrics vm ON b.region_name = vm.geography
            WHERE b.region_name = 'Washington'
            AND vm.metric_type = 'unemployment'
            ORDER BY vm.observation_date DESC LIMIT 1
        `);
        console.table(res3.rows);

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

verifyGeoNames();
