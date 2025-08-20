/**
 * @description
 * This file is the primary entry point for the application's database schema.
 * It imports and re-exports all individual table schemas, making them available
 * to Drizzle ORM and Drizzle Kit for migrations.
 *
 * Key features:
 * - Consolidates all schema definitions from the `db/schema/*` directory.
 * - Serves as the single source of truth for the `drizzle.config.ts` file.
 *
 * @dependencies
 * - `./schema/index`: Imports all schemas from the barrel file.
 *
 * @notes
 * - This approach allows for a clean and organized schema structure while maintaining
 *   compatibility with Drizzle's tooling.
 */

// We are exporting everything from the schema barrel file.
// This makes all tables, enums, and types available to the Drizzle client
// and Drizzle Kit under a single import.
export * from "./schema/index";
