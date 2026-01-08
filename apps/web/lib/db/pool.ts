import { Pool } from 'pg';

// Validate environment variables early
const dbConfig = {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
};

// Check for missing critical values to provide better error messages than "SCRAM" errors
Object.entries(dbConfig).forEach(([key, value]) => {
    if (!value && key !== 'port') {
        console.error(`❌ DATABASE CONNECTION ERROR: Missing environment variable ${key.toUpperCase()}.`);
    }
});

const pool = new Pool({
    ...dbConfig,
    ssl: {
        rejectUnauthorized: false
    }
});

export default pool;
