import { pool } from '../src/db/client.js';

async function diagnoseQuery() {
    const metric = 'unemployment';
    const targetDate = '2025-11-01'; // Known good date from view check

    console.log('--- DIAGNOSTIC START ---');
    try {
        console.time('Full Query Execution');
        
        const query = `
            SELECT 
                b.region_name,
                ST_AsGeoJSON(b.geometry)::json as geometry,
                vm.value as metric_value
            FROM analytics.vw_choropleth_boundaries b
            LEFT JOIN analytics.vw_geo_metrics vm 
                ON b.region_name = vm.geography 
                AND vm.metric_type = $1
                AND vm.observation_date = $2::date
        `;

        const res = await pool.query(query, [metric, targetDate]);
        console.timeEnd('Full Query Execution');
        
        console.log(`Row Count: ${res.rows.length}`);
        
        let totalSize = 0;
        res.rows.forEach(r => {
            totalSize += JSON.stringify(r).length;
        });
        
        console.log(`Estimated Payload Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

        if (res.rows.length > 0) {
            console.log('Sample Row:', JSON.stringify(res.rows[0]).substring(0, 100) + '...');
        }

    } catch (e) {
        console.error('DIAGNOSTIC FAILURE:', e);
    } finally {
        await pool.end();
    }
}

diagnoseQuery();
