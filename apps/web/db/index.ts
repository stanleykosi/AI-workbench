/**
 * @description
 * This file initializes and exports the Drizzle ORM client for the application.
 * It serves as the central point for database access, ensuring a single,
 * consistent connection to the Supabase PostgreSQL database.
 *
 * Key features:
 * - Creates a database client using the `postgres` driver for consistent connectivity.
 * - Connects to the database using the `SUPABASE_DATABASE_URL` environment variable.
 * - Exports the `db` client instance for use in Server Actions and other server-side logic.
 *
 * @dependencies
 * - `drizzle-orm/postgres-js`: Provides the Drizzle client for PostgreSQL databases.
 * - `postgres`: The PostgreSQL driver for Node.js.
 * - `./schema`: Imports all table definitions to make them available to the ORM.
 *
 * @notes
 * - This setup is crucial for performing database operations (CRUD) from the Next.js backend.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.SUPABASE_DATABASE_URL) {
  throw new Error("SUPABASE_DATABASE_URL environment variable is not set");
}

const sql = postgres(process.env.SUPABASE_DATABASE_URL);

export const db = drizzle(sql, { schema });
