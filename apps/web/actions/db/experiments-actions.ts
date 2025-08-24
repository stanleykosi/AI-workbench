/**
 * @description
 * This file contains the Server Actions for managing experiment records in the database.
 * These actions handle the logic for fetching experiment data, ensuring that users
 * can only access experiments related to their own projects.
 *
 * Key features:
 * - `getExperimentsForProjectAction`: Fetches all experiment records for a specific project.
 * - `getExperimentByIdAction`: Fetches a single experiment by its ID, ensuring user ownership.
 *
 * @dependencies
 * - `@clerk/nextjs/server`: For `auth()` to get user and session details.
 * - `drizzle-orm`: For database query operators like `eq` and `and`.
 * - `@/db`: The Drizzle ORM client instance.
 * - `@/db/schema`: The database table definitions for experiments and projects.
 * - `@repo/types`: The shared `ActionState` type for consistent action responses.
 */
"use server";

import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { experimentsTable, projectsTable, type SelectExperiment } from "@/db/schema";
import { type ActionState } from "@repo/types";

/**
 * Fetches all experiment records for a given project, ensuring the user has access.
 *
 * @param projectId - The ID of the project whose experiments are to be fetched.
 * @returns A promise that resolves to an `ActionState` containing the list of experiments or an error message.
 */
export async function getExperimentsForProjectAction(
  projectId: string,
): Promise<ActionState<SelectExperiment[]>> {
  const { userId } = auth();

  // 1. Authentication Check
  if (!userId) {
    return {
      isSuccess: false,
      message: "Unauthorized: You must be logged in.",
    };
  }

  // 2. Input Validation (Basic)
  if (!projectId) {
    return { isSuccess: false, message: "Invalid project ID." };
  }

  try {
    // 3. Database Query with Authorization
    // First, verify the user has access to this project.
    const [project] = await db
      .select({ id: projectsTable.id })
      .from(projectsTable)
      .where(
        and(eq(projectsTable.id, projectId), eq(projectsTable.userId, userId)),
      );

    if (!project) {
      return {
        isSuccess: false,
        message: "Project not found or you do not have permission.",
      };
    }

    // Then, fetch the experiments for the authorized project.
    const experiments = await db
      .select()
      .from(experimentsTable)
      .where(eq(experimentsTable.projectId, projectId))
      .orderBy(desc(experimentsTable.createdAt));

    return {
      isSuccess: true,
      message: "Experiments fetched successfully.",
      data: experiments,
    };
  } catch (error) {
    console.error("Error fetching experiments:", error);
    return {
      isSuccess: false,
      message: "Database Error: Failed to fetch experiments.",
    };
  }
}

/**
 * Fetches a single experiment by its ID, ensuring it belongs to the current user's project.
 *
 * @param experimentId - The ID of the experiment to fetch.
 * @returns A promise that resolves to an `ActionState` containing the experiment or an error message.
 */
export async function getExperimentByIdAction(
  experimentId: string,
): Promise<ActionState<SelectExperiment>> {
  const { userId } = auth();

  if (!userId) {
    return { isSuccess: false, message: "Unauthorized: You must be logged in." };
  }
  if (!experimentId) {
    return { isSuccess: false, message: "Invalid experiment ID." };
  }

  try {
    // This query joins the experiments table with the projects table to verify
    // that the experiment belongs to a project owned by the current user.
    const [result] = await db
      .select({
        id: experimentsTable.id,
        projectId: experimentsTable.projectId,
        datasetId: experimentsTable.datasetId,
        temporalWorkflowId: experimentsTable.temporalWorkflowId,
        status: experimentsTable.status,
        modelConfig: experimentsTable.modelConfig,
        performanceMetrics: experimentsTable.performanceMetrics,
        modelArtifactS3Key: experimentsTable.modelArtifactS3Key,
        createdAt: experimentsTable.createdAt,
      })
      .from(experimentsTable)
      .innerJoin(projectsTable, eq(experimentsTable.projectId, projectsTable.id))
      .where(
        and(
          eq(experimentsTable.id, experimentId),
          eq(projectsTable.userId, userId),
        ),
      );

    if (!result) {
      return {
        isSuccess: false,
        message: "Experiment not found or you do not have permission.",
      };
    }

    return { isSuccess: true, message: "Experiment fetched successfully.", data: result };
  } catch (error) {
    console.error(`Error fetching experiment ${experimentId}:`, error);
    return { isSuccess: false, message: "Database Error: Failed to fetch experiment." };
  }
}
