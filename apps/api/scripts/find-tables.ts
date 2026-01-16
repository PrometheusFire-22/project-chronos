import { pool } from '../src/db/client.js';

async function inspectData() {
    try {
        console.log('--- Finding table us_states ---');
        const res = await pool.query(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_name = 'us_states' OR table_name = 'ca_provinces'
        `);
        console.table(res.rows);

        if (res.rows.length > 0) {
            const first = res.rows[0];
            const fullTable = `${first.table_schema}.${first.table_name}`;
            console.log(`\n--- Columns of ${fullTable} ---`);
            const cols = await pool.query(`SELECT * FROM ${fullTable} LIMIT 1`);
            console.log(Object.keys(cols.rows[0]));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

inspectData();
