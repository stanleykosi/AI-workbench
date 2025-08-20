/**
 * @description
 * This file defines the Drizzle schema for the `projects` table.
 * Projects are the top-level organizational unit for users' work in the AI Workbench.
 *
 * Key features:
 * - `id`: A unique UUID for each project.
 * - `name`: The user-defined name of the project.
 * - `userId`: Foreign key linking to the user who owns the project (from Clerk).
 * - `createdAt`, `updatedAt`: Timestamps for tracking project creation and updates.
 *
 * @dependencies
 * - `drizzle-orm/pg-core`: Provides the functions to define PostgreSQL table schemas.
 *
 * @notes
 * - The `userId` is crucial for enforcing data isolation and user ownership.
 */
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const projectsTable = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type SelectProject = typeof projectsTable.$inferSelect;
export type InsertProject = typeof projectsTable.$inferInsert;
