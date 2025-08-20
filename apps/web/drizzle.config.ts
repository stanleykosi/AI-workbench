/**
 * @description
 * This file contains the configuration for Drizzle Kit, the command-line tool
 * used to manage database migrations and schema generation for Drizzle ORM.
 *
 * Key features:
 * - `schema`: Specifies the path to the main schema file where all database tables are defined.
 * - `out`: Defines the directory where Drizzle Kit will generate SQL migration files.
 * - `driver`: Sets the database driver to 'pg' for PostgreSQL.
 * - `dbCredentials`: Provides the connection string for the Supabase database, loaded
 *   from environment variables.
 *
 * @dependencies
 * - `dotenv/config`: Loads environment variables from a `.env` file into `process.env`.
 * - `drizzle-kit`: The core library for Drizzle Kit configuration.
 *
 * @notes
 * - This configuration is used by the `db:generate` and `db:push` scripts in `package.json`.
 */
import "dotenv/config";
import type { Config } from "drizzle-kit";

if (!process.env.SUPABASE_DATABASE_URL) {
  throw new Error("SUPABASE_DATABASE_URL environment variable is not set");
}

export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.SUPABASE_DATABASE_URL,
  },
} satisfies Config;
