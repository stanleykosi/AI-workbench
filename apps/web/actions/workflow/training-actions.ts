/**
 * @description
 * This file contains the Server Action responsible for initiating a model training workflow.
 * It acts as the bridge between the Next.js frontend and the Temporal/Python backend,
 * orchestrating the initial steps of a training job.
 *
 * Key features:
 * - `startTrainingAction`: A server action that:
 *   1. Authenticates the user with Clerk.
 *   2. Authorizes that the user owns the specified project and dataset.
 *   3. Creates a new 'experiment' record in the database with a 'pending' status.
 *   4. Starts the `TrainModelWorkflow` in Temporal, passing all necessary parameters.
 *   5. Returns the new experiment's ID to the client for UI updates.
 *
 * @dependencies
 * - `zod`: For validating the incoming `modelConfig`.
 * - `@clerk/nextjs/server`: For `auth()` to get user session data.
 * - `@repo/types`: The shared `ActionState` type.
 * - `@/lib/temporal`: The singleton Temporal client instance.
 * - `@/db`: The Drizzle client for database operations.
 * - `@/db/schema`: Database table definitions, specifically `experimentsTable`.
 * - `@/actions/db/projects-actions`: To verify project ownership.
 * - `@/actions/db/datasets-actions`: To verify dataset ownership and get its S3 key.
 *
 * @notes
 * - The `taskQueue` must match the queue that the Python Temporal worker is listening on.
 * - The `workflowId` is made unique by combining 'train-' with the new experiment's UUID.
 */
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { type ActionState } from "@repo/types";
import { db } from "@/db";
import { experimentsTable, type SelectExperiment } from "@/db/schema";
import { temporalClient } from "@/lib/temporal";
import { getDatasetByIdAction } from "../db/datasets-actions";
import { getProjectByIdAction } from "../db/projects-actions";

// Schema to validate the model configuration object.
// Ensures that `modelName` is a non-empty string.
const ModelConfigSchema = z.object({
  modelName: z.string().min(1, "Model name is required."),
});

interface StartTrainingParams {
  projectId: string;
  datasetId: string;
  modelConfig: { modelName: string;[key: string]: any };
}

/**
 * Initiates a model training workflow.
 *
 * @param params - The parameters required to start the training workflow.
 * @returns A promise that resolves to an `ActionState` containing the new experiment's data.
 */
export async function startTrainingAction(
  params: StartTrainingParams,
): Promise<ActionState<SelectExperiment>> {
  const { projectId, datasetId, modelConfig } = params;
  const { userId } = auth();

  // 1. Authentication Check
  if (!userId) {
    return { isSuccess: false, message: "Unauthorized" };
  }

  // 2. Input Validation
  const validatedConfig = ModelConfigSchema.safeParse(modelConfig);
  if (!validatedConfig.success) {
    return {
      isSuccess: false,
      message: validatedConfig.error.errors[0]?.message ?? "Invalid model config.",
    };
  }

  try {
    // 3. Authorization & Data Verification
    // Verify the user owns the project and the dataset exists and belongs to them.
    const projectResult = await getProjectByIdAction(projectId);
    if (!projectResult.isSuccess || !projectResult.data) {
      return { isSuccess: false, message: "Project not found or unauthorized." };
    }

    const datasetResult = await getDatasetByIdAction(datasetId);
    if (!datasetResult.isSuccess || !datasetResult.data) {
      return { isSuccess: false, message: "Dataset not found or unauthorized." };
    }
    const dataset = datasetResult.data;

    // 4. Create Initial Experiment Record in DB
    // A unique workflow ID is generated to link this record to the Temporal workflow.
    const [newExperiment] = await db
      .insert(experimentsTable)
      .values({
        projectId: projectId,
        datasetId: datasetId,
        temporalWorkflowId: `train-${crypto.randomUUID()}`,
        status: "pending", // The initial status before the workflow starts
        modelConfig: modelConfig,
      })
      .returning();

    if (!newExperiment) {
      return { isSuccess: false, message: "Failed to create experiment record." };
    }

    // 5. Start Temporal Workflow
    await temporalClient.workflow.start("TrainModelWorkflow", {
      taskQueue: "ml-training-task-queue",
      workflowId: newExperiment.temporalWorkflowId,
      args: [
        // The arguments must be passed as an array and match the Python workflow's `run` method signature.
        {
          experiment_id: newExperiment.id,
          project_id: projectId,
          user_id: userId,
          dataset_s3_key: dataset.s3Key,
          model_config: modelConfig,
        },
      ],
    });

    return {
      isSuccess: true,
      message: "Training workflow started successfully.",
      data: newExperiment,
    };
  } catch (error) {
    console.error("Error starting training workflow:", error);
    // This could be a database error or a Temporal connection error.
    return { isSuccess: false, message: "Failed to start training workflow." };
  }
}
