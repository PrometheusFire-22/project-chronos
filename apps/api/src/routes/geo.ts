import { Hono } from 'hono';
import { pool } from '../db/client.js';

const geo = new Hono();

/**
 * GET /api/geo/choropleth
 * Returns a FeatureCollection of geometries joined with the requested metric values.
 * 
 * Query Params:
 * - metric: string ('unemployment', 'hpi')
 * - date: string (ISO date)
 */
geo.get('/choropleth', async (c) => {
    // Default to unemployment if not specified, normalize to lowercase
    const metric = (c.req.query('metric') || 'unemployment').toLowerCase();
    const dateParam = c.req.query('date');
    
    try {
        console.log(`[GEO] Request received for metric: ${metric}, date: ${dateParam}`);
        
        // Step 1: Determine the target date (User provided OR latest available)
        let targetDate = dateParam;
        if (!targetDate) {
            const dateRes = await pool.query(`
                SELECT MAX(observation_date) as val 
                FROM analytics.vw_geo_metrics 
                WHERE metric_type = $1
            `, [metric]);
            
            if (dateRes.rows.length > 0 && dateRes.rows[0].val) {
                targetDate = new Date(dateRes.rows[0].val).toISOString().split('T')[0];
                console.log(`[GEO] Latest date found: ${targetDate}`);
            } else {
                return c.json({ type: 'FeatureCollection', features: [] });
            }
        }

        const validDate = targetDate ? targetDate : null;

        // QUERY BRANCHING:
        // mode=data: lighter query, return plain JSON array of values (FAST)
        // mode=geo (default): return heavy GeoJSON with geometry (SLOW, LEGACY)
        const mode = c.req.query('mode') || 'geo';

        console.log(`[GEO] Fetching Map Data (mode=${mode}, date=${validDate || 'latest'})...`);
        
        let query = '';
        if (mode === 'data') {
            query = `
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
        } else {
             query = `
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
                    b.region_name,
                    b.country_code,
                    ST_AsGeoJSON(b.geometry)::json as geometry,
                    lm.value as metric_value,
                    lm.units,
                    lm.metric_type,
                    lm.observation_date
                FROM analytics.vw_choropleth_boundaries b
                LEFT JOIN latest_metrics lm 
                    ON b.region_name = lm.geography 
                ORDER BY lm.value DESC NULLS LAST
            `;
        }

        const res = await pool.query(query, [metric, targetDate]);
        console.log(`[GEO] Query completed. Rows: ${res.rows.length}`);

        if (mode === 'data') {
            // Return lightweight JSON array
            return c.json({
                type: 'DataCollection',
                data: res.rows.map(row => ({
                    name: row.name,
                    country: row.country,
                    value: row.value,
                    units: row.units,
                    metric: row.metric,
                    date: row.date
                }))
            });
        } 
        
        // Legacy/Default GeoJSON
        const features = res.rows.map(row => ({
            type: 'Feature',
            geometry: row.geometry,
            properties: {
                name: row.region_name,
                country: row.country_code,
                value: row.metric_value,
                units: row.units,
                metric: metric,
                date: row.observation_date || targetDate
            }
        }));

        return c.json({
            type: 'FeatureCollection',
            features
        });

    } catch (error: any) {
        console.error('Geospatial Query Error:', error);
        return c.json({ 
            error: 'Failed to generate map data',
            details: error.message 
        }, 500);
    }
});

export default geo;
