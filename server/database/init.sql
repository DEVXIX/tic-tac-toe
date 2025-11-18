-- Database initialization
-- Create role if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'beaconred') THEN

      CREATE ROLE "beaconred" LOGIN PASSWORD 'beaconred';
   END IF;
END
$do$;

-- Grant all privileges to the user
GRANT ALL PRIVILEGES ON DATABASE db TO "beaconred";

-- Allow user to create databases (needed for Prisma)
ALTER USER "beaconred" CREATEDB;
