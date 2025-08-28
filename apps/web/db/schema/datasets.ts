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
 * - `source`: The source of the dataset (e.g., 'upload', 'tiingo', 'manual').
 * - `tiingoFetchId`: Optional reference to Tiingo fetch details if the dataset came from Tiingo.
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
export const datasetSourceEnum = pgEnum("dataset_source", ["upload", "tiingo", "manual"]);

export const datasetsTable = pgTable("datasets", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projectsTable.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  s3Key: text("s3_key").notNull().unique(),
  status: datasetStatusEnum("status").default("uploading").notNull(),
  source: datasetSourceEnum("source").default("upload").notNull(),
  tiingoFetchId: uuid("tiingo_fetch_id"), // Optional reference to Tiingo fetch details
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * @description
 * This table stores detailed information about Tiingo data fetches.
 * It contains all the parameters used to fetch data from Tiingo API.
 */
export const tiingoFetchesTable = pgTable("tiingo_fetches", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projectsTable.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").notNull(),
  dataType: text("data_type").notNull(), // stock, crypto, forex, iex
  symbol: text("symbol").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  frequency: text("frequency").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SelectDataset = typeof datasetsTable.$inferSelect;
export type InsertDataset = typeof datasetsTable.$inferInsert;
export type SelectTiingoFetch = typeof tiingoFetchesTable.$inferSelect;
export type InsertTiingoFetch = typeof tiingoFetchesTable.$inferInsert;
