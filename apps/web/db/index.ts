/**
 * @description
 * This file initializes and exports the Drizzle ORM client for the application.
 * It serves as the central point for database access, ensuring a single,
 * consistent connection to the Supabase PostgreSQL database.
 *
 * Key features:
 * - Creates a database client using the serverless-compatible `@neondatabase/serverless` driver.
 * - Connects to the database using the `SUPABASE_DATABASE_URL` environment variable.
 * - Exports the `db` client instance for use in Server Actions and other server-side logic.
 *
 * @dependencies
 * - `drizzle-orm/neon-http`: Provides the Drizzle client for Neon/Supabase databases.
 * - `@neondatabase/serverless`: The PostgreSQL driver optimized for serverless environments.
 * - `./schema`: Imports all table definitions to make them available to the ORM.
 *
 * @notes
 * - This setup is crucial for performing database operations (CRUD) from the Next.js backend.
 */
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.SUPABASE_DATABASE_URL) {
  throw new Error("SUPABASE_DATABASE_URL environment variable is not set");
}

const sql = neon(process.env.SUPABASE_DATABASE_URL);

export const db = drizzle(sql, { schema });
