/**
 * @description
 * This file defines the Drizzle schema for the `experiments` table.
 * An experiment represents a single model training run, tracking its configuration,
 * status, and results.
 *
 * Key features:
 * - `id`: A unique UUID for each experiment.
 * - `projectId`: Foreign key to the parent project.
 * - `datasetId`: Foreign key to the dataset used for training.
 * - `temporalWorkflowId`: Unique ID linking the experiment to its Temporal workflow.
 * - `status`: Enum tracking the experiment's state (e.g., 'pending', 'running', 'completed').
 * - `modelConfig`: JSONB field to store the configuration used for the training run.
 * - `performanceMetrics`: JSONB field to store results like MAE, RMSE, etc.
 * - `modelArtifactS3Key`: The S3 key for the trained model artifact (e.g., .pkl file).
 *
 * @dependencies
 * - `drizzle-orm/pg-core`: Provides schema definition functions for PostgreSQL.
 * - `./projects`: Imports `projectsTable` for foreign key relationship.
 * - `./datasets`: Imports `datasetsTable` for foreign key relationship.
 *
 * @notes
 * - `onDelete: "set null"` for `datasetId` means if a dataset is deleted, the experiment record
 *   is kept, but its link to the dataset is removed. This preserves the experiment's history.
 */
import { pgTable, text, timestamp, uuid, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { projectsTable } from "./projects";
import { datasetsTable } from "./datasets";

export const experimentStatusEnum = pgEnum("experiment_status", ["pending", "running", "completed", "failed"]);

export const experimentsTable = pgTable("experiments", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projectsTable.id, { onDelete: "cascade" }).notNull(),
  datasetId: uuid("dataset_id").references(() => datasetsTable.id, { onDelete: "set null" }),
  temporalWorkflowId: text("temporal_workflow_id").notNull().unique(),
  status: experimentStatusEnum("status").default("pending").notNull(),
  modelConfig: jsonb("model_config").notNull(),
  performanceMetrics: jsonb("performance_metrics"),
  modelArtifactS3Key: text("model_artifact_s3_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SelectExperiment = typeof experimentsTable.$inferSelect;
export type InsertExperiment = typeof experimentsTable.$inferInsert;
