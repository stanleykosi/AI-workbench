/**
 * @description
 * This file serves as a central barrel file to export all Drizzle ORM table schemas.
 * It simplifies importing schemas into other parts of the application, such as the
 * main Drizzle client instance and Server Actions.
 *
 * Key features:
 * - Re-exports all table definitions and related types/enums from their individual schema files.
 *
 * @notes
 * - This pattern helps keep the database schema organized and modular. As new tables are added, they
 *   should be exported from here.
 */
export * from "./projects";
export * from "./datasets";
export * from "./experiments";
export * from "./deployments";
