/**
 * @description
 * This file contains the Server Action responsible for initiating a model deployment workflow.
 * It serves as the bridge between the frontend UI and the backend deployment orchestration.
 *
 * Key features:
 * - `startDeploymentAction`: A server action that:
 *   1. Authenticates the user with Clerk.
 *   2. Authorizes that the user owns the experiment they are trying to deploy.
 *   3. Verifies that the experiment's status is 'completed'.
 *   4. Creates an initial 'deployment' record in the database with a 'deploying' status.
 *   5. Starts the `DeployModelWorkflow` in Temporal, passing the necessary IDs.
 *   6. Revalidates relevant page paths to update the UI.
 *
 * @dependencies
 * - `next/cache`: For `revalidatePath` to trigger UI updates.
 * - `@clerk/nextjs/server`: For `auth()` to get user session data.
 * - `drizzle-orm`: For database query operators.
 * - `@repo/types`: The shared `ActionState` type.
 * - `@/db`: The Drizzle client and schema definitions.
 * - `@/lib/temporal`: The singleton Temporal client instance.
 */
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  deploymentsTable,
  experimentsTable,
  projectsTable,
} from "@/db/schema";
import { temporalClient } from "@/lib/temporal";
import { type ActionState } from "@repo/types";

/**
 * Initiates a model deployment workflow.
 *
 * @param experimentId - The ID of the completed experiment to deploy.
 * @returns A promise that resolves to an `ActionState` containing the new deployment's ID.
 */
export async function startDeploymentAction(
  experimentId: string,
): Promise<ActionState<{ deploymentId: string }>> {
  const { userId } = auth();

  // 1. Authentication Check
  if (!userId) {
    return { isSuccess: false, message: "Unauthorized" };
  }

  // 2. Input Validation
  if (!experimentId) {
    return { isSuccess: false, message: "Experiment ID is required." };
  }

  try {
    // 3. Authorization & Precondition Check
    // Verify the user owns the project this experiment belongs to and that the experiment is completed.
    const [experiment] = await db
      .select({
        projectId: experimentsTable.projectId,
        status: experimentsTable.status,
      })
      .from(experimentsTable)
      .innerJoin(projectsTable, eq(experimentsTable.projectId, projectsTable.id))
      .where(
        and(
          eq(experimentsTable.id, experimentId),
          eq(projectsTable.userId, userId),
        ),
      );

    if (!experiment) {
      return {
        isSuccess: false,
        message: "Experiment not found or you do not have permission.",
      };
    }

    if (experiment.status !== "completed") {
      return {
        isSuccess: false,
        message: "Only completed experiments can be deployed.",
      };
    }

    // 4. Create Initial Deployment Record in DB
    const [newDeployment] = await db
      .insert(deploymentsTable)
      .values({
        experimentId,
        status: "deploying", // Set initial status
      })
      .returning();

    if (!newDeployment) {
      return { isSuccess: false, message: "Failed to create deployment record." };
    }

    // 5. Start Temporal Workflow
    const workflowId = `deploy-${newDeployment.id}`;
    await temporalClient.workflow.start("DeployModelWorkflow", {
      taskQueue: "ml-training-task-queue", // Using the same queue for simplicity
      workflowId,
      args: [
        {
          deployment_id: newDeployment.id,
          experiment_id: experimentId,
        },
      ],
    });

    // 6. Revalidate UI paths to show the new 'deploying' state.
    revalidatePath(`/dashboard/projects/${experiment.projectId}/deployments`);
    revalidatePath(`/dashboard/projects/${experiment.projectId}/experiments`);

    return {
      isSuccess: true,
      message: "Deployment workflow started successfully.",
      data: { deploymentId: newDeployment.id },
    };
  } catch (error) {
    console.error("Error starting deployment workflow:", error);
    return {
      isSuccess: false,
      message: "Failed to start deployment workflow.",
    };
  }
}
