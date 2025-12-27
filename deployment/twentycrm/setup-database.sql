-- TwentyCRM PostgreSQL Schema Setup
-- Run this on the Lightsail VM: sudo -u postgres psql -d chronos -f setup-database.sql

-- Create schema for TwentyCRM
CREATE SCHEMA IF NOT EXISTS twenty;

-- Create dedicated user for TwentyCRM
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'twenty_user') THEN
    CREATE USER twenty_user WITH ENCRYPTED PASSWORD 'TwentySecure2025!ChangeMe';
  END IF;
END
$$;

-- Grant schema privileges
GRANT USAGE ON SCHEMA twenty TO twenty_user;
GRANT CREATE ON SCHEMA twenty TO twenty_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA twenty TO twenty_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA twenty TO twenty_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA twenty GRANT ALL ON TABLES TO twenty_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA twenty GRANT ALL ON SEQUENCES TO twenty_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA twenty GRANT ALL ON FUNCTIONS TO twenty_user;

-- Verify setup
\echo 'Schema created successfully!'
\dn twenty
\du twenty_user
