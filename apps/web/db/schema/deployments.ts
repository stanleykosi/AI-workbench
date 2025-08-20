/**
 * @description
 * This file defines the Drizzle schema for the `deployments` table.
 * A deployment represents a trained model that has been exposed as a live,
 * queryable API endpoint via Modal.
 *
 * Key features:
 * - `id`: A unique UUID for each deployment.
 * - `experimentId`: Foreign key linking the deployment back to the specific experiment/model that was deployed.
 * - `modalEndpointUrl`: The stable URL provided by Modal for the inference endpoint.
 * - `status`: Enum tracking the deployment's state (e.g., 'deploying', 'active', 'error').
 * - `createdAt`: Timestamp for tracking when the deployment was initiated.
 *
 * @dependencies
 * - `drizzle-orm/pg-core`: Provides schema definition functions for PostgreSQL.
 * - `./experiments`: Imports the `experimentsTable` for establishing a foreign key relationship.
 *
 * @notes
 * - The `modalEndpointUrl` is the final output for the user, which they will use to configure
 *   their Allora prediction node.
 */
import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { experimentsTable } from "./experiments";

export const deploymentStatusEnum = pgEnum("deployment_status", ["deploying", "active", "inactive", "error"]);

export const deploymentsTable = pgTable("deployments", {
  id: uuid("id").defaultRandom().primaryKey(),
  experimentId: uuid("experiment_id").references(() => experimentsTable.id, { onDelete: "cascade" }).notNull(),
  modalEndpointUrl: text("modal_endpoint_url"),
  status: deploymentStatusEnum("status").default("deploying").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SelectDeployment = typeof deploymentsTable.$inferSelect;
export type InsertDeployment = typeof deploymentsTable.$inferInsert;
