import { pool } from '../src/db/client.js';

async function checkSeriesNames() {
    try {
        console.log('--- Series Names containing Unemployment ---');
        const res = await pool.query(`
            SELECT series_id, series_name, geography 
            FROM metadata.series_metadata 
            WHERE series_name LIKE '%Unemployment Rate%' 
            LIMIT 10
        `);
        console.table(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

checkSeriesNames();
