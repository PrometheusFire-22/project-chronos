import { pool } from '../src/db/client.js';

async function inspectData() {
    try {
        console.log('--- Series Metadata (Sample) ---');
        const meta = await pool.query('SELECT * FROM metadata.series_metadata LIMIT 5');
        console.table(meta.rows);
        
        console.log('\n--- US States (Columns) ---');
        const states = await pool.query('SELECT * FROM us_states LIMIT 1');
        console.log(Object.keys(states.rows[0]));

        console.log('\n--- Canada Provinces (Columns) ---');
        const provs = await pool.query('SELECT * FROM ca_provinces LIMIT 1');
        console.log(Object.keys(provs.rows[0]));

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

inspectData();
