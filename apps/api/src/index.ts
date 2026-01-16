import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { config } from 'dotenv';
import { pool } from './db/client.js';
import geoRouter from './routes/geo.js';

// Load environment variables
config();

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests', 'Content-Type'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}));

// Health check
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'chronos-api',
    version: '0.1.0'
  });
});

// DB Health route
app.get('/health/db', async (c) => {
  try {
    const result = await pool.query('SELECT NOW()');
    return c.json({
      status: 'ok',
      db_time: result.rows[0].now
    });
  } catch (error: any) {
    console.error('Database health check failed:', error);
    return c.json({
      status: 'error',
      message: 'Database connection failed',
      details: error.message
    }, 500);
  }
});

// Mount Routes
app.route('/api/geo', geoRouter);

// Switch default port to 3005 to avoid zombie process on 3002
const port = process.env.PORT ? parseInt(process.env.PORT) : 3005;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
