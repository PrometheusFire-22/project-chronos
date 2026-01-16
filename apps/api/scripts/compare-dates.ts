import { pool } from '../src/db/client.js';

async function compareDates() {
    try {
        const res = await pool.query(`
            SELECT geography, MAX(observation_date) as max_date
            FROM analytics.vw_geo_metrics
            WHERE metric_type = 'unemployment'
            AND geography IN ('California', 'Washington', 'Texas')
            GROUP BY geography
        `);
        console.table(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
compareDates();
