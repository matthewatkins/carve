-- Create databases for auth and api servers
CREATE DATABASE auth_db;
CREATE DATABASE api_db;

-- Grant privileges to postgres user
GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE api_db TO postgres;