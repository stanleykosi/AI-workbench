/**
 * @description
 * This file defines the Drizzle schema for the `datasets` table.
 * Datasets are user-uploaded files (e.g., CSVs) associated with a specific project,
 * which are used as the data source for model training.
 *
 * Key features:
 * - `id`: A unique UUID for each dataset.
 * - `projectId`: A foreign key linking the dataset to a project, with cascading deletes.
 * - `name`: The user-provided name for the dataset.
 * - `s3Key`: The unique key for the corresponding file object stored in AWS S3.
 * - `status`: An enum tracking the dataset's state (e.g., 'uploading', 'ready').
 * - `createdAt`: Timestamp for tracking when the dataset was created.
 *
 * @dependencies
 * - `drizzle-orm/pg-core`: Provides schema definition functions for PostgreSQL.
 * - `./projects`: Imports the `projectsTable` for establishing a foreign key relationship.
 *
 * @notes
 * - The `onDelete: "cascade"` ensures that if a project is deleted, all its associated datasets are also deleted.
 */
import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { projectsTable } from "./projects";

export const datasetStatusEnum = pgEnum("dataset_status", ["uploading", "ready", "error"]);

export const datasetsTable = pgTable("datasets", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projectsTable.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  s3Key: text("s3_key").notNull().unique(),
  status: datasetStatusEnum("status").default("uploading").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SelectDataset = typeof datasetsTable.$inferSelect;
export type InsertDataset = typeof datasetsTable.$inferInsert;
