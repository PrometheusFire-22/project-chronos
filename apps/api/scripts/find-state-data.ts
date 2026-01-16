import { pool } from '../src/db/client.js';

async function findStateSeries() {
    try {
        console.log('--- Finding "Unemployment Rate" for Geography = "California" (Example) ---');
        // We know geography column exists from previous checks
        const res = await pool.query(`
            SELECT series_id, series_name, geography, frequency, units
            FROM metadata.series_metadata 
            WHERE series_name ILIKE '%Unemployment Rate%' 
              AND geography = 'California'
        `);
        console.table(res.rows);

        console.log('\n--- Finding "All-Transactions House Price Index" for Geography = "Texas" (Example) ---');
        const res2 = await pool.query(`
            SELECT series_id, series_name, geography, frequency, units
            FROM metadata.series_metadata 
            WHERE series_name ILIKE '%House Price Index%' 
              AND geography = 'Texas'
        `);
        console.table(res2.rows);

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

findStateSeries();
