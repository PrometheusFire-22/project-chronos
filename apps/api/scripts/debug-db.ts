import { pool } from '../src/db/client.js';

async function checkDb() {
    try {
        console.log('Test 1: Connecting...');
        const res = await pool.query('SELECT 1 as val');
        console.log('Test 1 Result:', res.rows[0]);

        console.log('Test 2: Querying View Count...');
        const res2 = await pool.query('SELECT count(*) FROM analytics.vw_geo_metrics');
        console.log('Test 2 Result:', res2.rows[0]);

    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        await pool.end();
    }
}
checkDb();
