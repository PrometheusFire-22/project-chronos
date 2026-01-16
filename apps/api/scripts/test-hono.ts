import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: "postgresql://chronos:DZ4eNOynmfYVOtG8c8TBlXIGVGlqkvWKQR5ixYYjAMs=@16.52.210.100:5432/chronos",
});

const app = new Hono();

app.get('/', async (c) => {
    // Try a query
    try {
        await pool.query('SELECT 1');
        return c.text('Hello Hono with DB!');
    } catch (e) {
        return c.text('DB Failed: ' + e.message);
    }
});

const port = 3005;
console.log(`Test Server running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
