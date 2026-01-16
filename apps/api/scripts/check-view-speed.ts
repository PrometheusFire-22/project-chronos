import { pool } from '../src/db/client.js';

async function checkSpeed() {
    try {
        console.time('View LIMIT 1');
        const res = await pool.query('SELECT region_name FROM analytics.vw_choropleth_boundaries LIMIT 1');
        console.timeEnd('View LIMIT 1');
        console.log('Result:', res.rows[0]);

        console.time('View Full Count');
        const resCount = await pool.query('SELECT count(*) FROM analytics.vw_choropleth_boundaries');
        console.timeEnd('View Full Count');
        console.log('Count:', resCount.rows[0].count);

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

checkSpeed();
