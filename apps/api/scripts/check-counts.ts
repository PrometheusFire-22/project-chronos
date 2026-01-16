import { pool } from '../src/db/client.js';

async function checkCounts() {
    try {
        console.log('--- Checking Row Counts ---');
        const resUS = await pool.query('SELECT count(*) FROM geospatial.us_states');
        console.log(`US States Rows: ${resUS.rows[0].count}`);

        const resCA = await pool.query('SELECT count(*) FROM geospatial.ca_provinces');
        console.log(`CA Provinces Rows: ${resCA.rows[0].count}`);

        console.log('\n--- Checking Metrics View Count ---');
        const resView = await pool.query('SELECT count(*) FROM analytics.vw_geo_metrics');
        console.log(`Metrics Rows: ${resView.rows[0].count}`);

        console.log('\n--- Checking specific metric join ---');
        const query = `
            SELECT count(*) 
            FROM geospatial.us_states s
            LEFT JOIN analytics.vw_geo_metrics vm 
                ON s.name = vm.geography 
                AND vm.metric_type = 'unemployment'
        `;
        const resJoin = await pool.query(query);
        console.log(`Join Result Rows: ${resJoin.rows[0].count}`);

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

checkCounts();
