import { pool } from '../src/db/client.js';

async function checkMetrics() {
    try {
        console.log('--- Checking Distinct Metric Types ---');
        const res = await pool.query(`
            SELECT DISTINCT metric_type FROM analytics.vw_geo_metrics
        `);
        console.log(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
checkMetrics();
