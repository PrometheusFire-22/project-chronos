import pg from 'pg';
const { Pool } = pg;

// Use standard Node.js environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL environment variable is not set. Database connections will fail.');
}

// Create a standard PostgreSQL pool
// No Hyperdrive, no polyfills needed here as this runs on Node.js
export const pool = new Pool({
  connectionString,
  max: 20, // Standard pool size for Node.js
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});
