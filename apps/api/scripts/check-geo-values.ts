import { pool } from '../src/db/client.js';

async function checkGeography() {
    try {
        console.log('--- Distinct Geographies in Metadata ---');
        const res = await pool.query(`
            SELECT DISTINCT geography 
            FROM metadata.series_metadata 
            WHERE is_active = TRUE 
            LIMIT 20
        `);
        console.table(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

checkGeography();
