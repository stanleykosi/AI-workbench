/**
 * @description
 * This file contains the configuration for Drizzle Kit, the command-line tool
 * used to manage database migrations and schema generation for Drizzle ORM.
 *
 * Key features:
 * - `schema`: Specifies the path to the main schema file where all database tables are defined.
 * - `out`: Defines the directory where Drizzle Kit will generate SQL migration files.
 * - `dialect`: Sets the database dialect to 'postgresql'.
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
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SUPABASE_DATABASE_URL || "postgresql://placeholder",
  },
});
