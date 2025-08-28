/**
 * @description
 * This file contains the Server Actions for managing deployment records in the database.
 * These actions handle the logic for fetching deployment data, ensuring users can only
 * access deployments related to their own projects.
 *
 * Key features:
 * - `getDeploymentsForProjectAction`: Fetches all deployment records for a specific project.
 *
 * @dependencies
 * - `@clerk/nextjs/server`: For `auth()` to get user and session details.
 * - `drizzle-orm`: For database query operators and relations.
 * - `@/db`: The Drizzle ORM client instance.
 * - `@/db/schema`: The database table definitions.
 * - `@repo/types`: The shared `ActionState` type for consistent action responses.
 */
"use server";

import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  deploymentsTable,
  experimentsTable,
  projectsTable,
  type SelectDeployment,
  type SelectExperiment,
} from "@/db/schema";
import { type ActionState } from "@repo/types";

// Define a more detailed type for the response, including the related experiment's model config.
export type DeploymentWithExperiment = SelectDeployment & {
  experiment: Pick<SelectExperiment, "modelConfig" | "projectId"> | null;
};

/**
 * Fetches all deployment records for a given project, ensuring the user has access.
 * It also joins the related experiment to retrieve the model name.
 *
 * @param projectId - The ID of the project whose deployments are to be fetched.
 * @returns A promise that resolves to an `ActionState` containing the list of deployments or an error message.
 */
export async function getDeploymentsForProjectAction(
  projectId: string,
): Promise<ActionState<DeploymentWithExperiment[]>> {
  const { userId } = auth();

  // 1. Authentication Check
  if (!userId) {
    return {
      isSuccess: false,
      message: "Unauthorized: You must be logged in.",
    };
  }

  // 2. Input Validation
  if (!projectId) {
    return { isSuccess: false, message: "Invalid project ID." };
  }

  try {
    // 3. Authorization Check: Verify the user owns the project.
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

    // 4. Database Query: Fetch deployments and join with experiments to get model info.
    const deployments = await db
      .select({
        id: deploymentsTable.id,
        experimentId: deploymentsTable.experimentId,
        modalEndpointUrl: deploymentsTable.modalEndpointUrl,
        status: deploymentsTable.status,
        createdAt: deploymentsTable.createdAt,
        modelConfig: experimentsTable.modelConfig,
        projectId: experimentsTable.projectId,
      })
      .from(deploymentsTable)
      .innerJoin(experimentsTable, eq(deploymentsTable.experimentId, experimentsTable.id))
      .where(eq(experimentsTable.projectId, projectId))
      .orderBy(desc(deploymentsTable.createdAt));

    const allDeployments = deployments.map((dep) => ({
      id: dep.id,
      experimentId: dep.experimentId,
      modalEndpointUrl: dep.modalEndpointUrl,
      status: dep.status,
      createdAt: dep.createdAt,
      experiment: {
        modelConfig: dep.modelConfig,
        projectId: dep.projectId
      },
    }));

    return {
      isSuccess: true,
      message: "Deployments fetched successfully.",
      data: allDeployments,
    };
  } catch (error) {
    console.error("Error fetching deployments:", error);
    return {
      isSuccess: false,
      message: "Database Error: Failed to fetch deployments.",
    };
  }
}
