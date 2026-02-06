import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' }); // Load from root .env

export default defineConfig({
  // Schema files location
  schema: './src/schema/**/*.ts',

  // Output directory for migrations
  out: './migrations',

  // Database driver
  dialect: 'postgresql',

  // Database connection
  dbCredentials: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USER || 'chronos',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'chronos',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },

  // Migration configuration
  verbose: true,
  strict: true,

  // Table prefix for Drizzle-managed tables
  // This helps distinguish Drizzle tables from Alembic-managed data warehouse tables
  // We'll use 'cms_' prefix for all CMS-related content tables
  tablesFilter: ['cms_*', 'app_*', 'auth_*'],
});
