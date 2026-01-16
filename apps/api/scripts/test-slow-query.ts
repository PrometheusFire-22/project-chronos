import { pool } from '../src/db/client.js';

async function testSlowQuery() {
    try {
        console.log('Testing potentially slow query...');
        console.time('Query');

        const metric = 'unemployment';
        const targetDate = null; // simulate undefined date

        const query = `
            WITH latest_metrics AS (
                SELECT DISTINCT ON (geography)
                    geography,
                    value,
                    units,
                    metric_type,
                    observation_date
                FROM analytics.vw_geo_metrics
                WHERE metric_type = $1
                AND ($2::date IS NULL OR observation_date <= $2::date)
                ORDER BY geography, observation_date DESC
            )
            SELECT 
                b.region_name as name,
                b.country_code as country,
                lm.value,
                lm.units,
                lm.metric_type as metric,
                lm.observation_date as date
            FROM analytics.vw_choropleth_boundaries b
            LEFT JOIN latest_metrics lm 
                ON b.region_name = lm.geography 
        `;

        const res = await pool.query(query, [metric, targetDate]);
        console.timeEnd('Query');
        console.log(`Rows returned: ${res.rows.length}`);
        if(res.rows.length > 0) console.log(res.rows[0]);

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
testSlowQuery();
