import { pool } from '../src/db/client.js';

async function createView() {
    try {
        console.log('--- Creating Schema "analytics" if not exists ---');
        await pool.query('CREATE SCHEMA IF NOT EXISTS analytics;');

        console.log('--- Creating View "analytics.vw_geo_metrics" ---');
        // This view creates a standardized interface for our map
        // It pre-filters only the relevant "Headline" metrics we care about
        const query = `
        CREATE OR REPLACE VIEW analytics.vw_geo_metrics AS
        SELECT 
            sm.geography,
            sm.series_id,
            CASE 
                WHEN sm.series_name ILIKE '%Unemployment Rate%' AND sm.series_name NOT ILIKE '%Civilian%' THEN 'unemployment'
                WHEN sm.series_name ILIKE '%All-Transactions House Price Index%' THEN 'hpi'
                ELSE 'other'
            END as metric_type,
            eo.observation_date,
            eo.value,
            sm.units
        FROM metadata.series_metadata sm
        JOIN timeseries.economic_observations eo ON sm.series_id = eo.series_id
        WHERE sm.is_active = TRUE 
          AND sm.geography IS NOT NULL
          AND (
               sm.series_name ILIKE '%Unemployment Rate%' 
            OR sm.series_name ILIKE '%All-Transactions House Price Index%'
          );
        `;
        
        await pool.query(query);
        console.log('View created successfully.');

        console.log('--- Testing View ---');
        const res = await pool.query(`
            SELECT * FROM analytics.vw_geo_metrics 
            WHERE metric_type = 'unemployment' 
            AND geography = 'California' 
            ORDER BY observation_date DESC 
            LIMIT 1
        `);
        console.table(res.rows);

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

createView();
