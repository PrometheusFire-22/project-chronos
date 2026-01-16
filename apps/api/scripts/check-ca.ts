import { pool } from '../src/db/client.js';

async function check() {
    try {
        const res = await pool.query('SELECT * FROM geospatial.ca_provinces LIMIT 1');
        console.log(Object.keys(res.rows[0]));
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
check();
