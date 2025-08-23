/**
 * @description
 * This file contains the Server Actions for managing dataset records in the database.
 * These actions handle the logic for creating and fetching dataset metadata,
 * ensuring data is correctly associated with projects and users.
 *
 * Key features:
 * - `createDatasetRecordAction`: Saves metadata about a newly uploaded dataset to the database.
 * - `getDatasetsForProjectAction`: Fetches all dataset records for a specific project.
 * - `getDatasetByIdAction`: Fetches a single dataset by its ID, ensuring user ownership.
 *
 * @dependencies
 * - `next/cache`: For `revalidatePath` to update the UI upon data mutation.
 * - `@clerk/nextjs/server`: For `auth()` to get user and session details.
 * - `drizzle-orm`: For database query operators like `eq` and `and`.
 * - `zod`: For robust schema-based input validation.
 * - `@/db`: The Drizzle ORM client instance.
 * - `@/db/schema`: The database table definitions for datasets and projects.
 * - `@repo/types`: The shared `ActionState` type for consistent action responses.
 */
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { datasetsTable, projectsTable, type SelectDataset } from "@/db/schema";
import { type ActionState } from "@repo/types";

// Schema for validating the input for creating a dataset record.
const CreateDatasetSchema = z.object({
  fileName: z.string().min(1, "File name cannot be empty."),
  s3Key: z.string().min(1, "S3 key cannot be empty."),
  projectId: z.string().uuid("Invalid project ID."),
});

/**
 * Creates a new dataset record in the database after a file has been successfully uploaded to S3.
 *
 * @param projectId - The ID of the project the dataset belongs to.
 * @param fileName - The original name of the uploaded file.
 * @param s3Key - The unique key of the file in the S3 bucket.
 * @returns A promise that resolves to an `ActionState` object indicating success or failure.
 */
export async function createDatasetRecordAction(
  projectId: string,
  fileName: string,
  s3Key: string,
): Promise<ActionState<SelectDataset>> {
  const { userId } = auth();

  // 1. Authentication Check
  if (!userId) {
    return {
      isSuccess: false,
      message: "Unauthorized: You must be logged in.",
    };
  }

  // 2. Input Validation
  const validatedFields = CreateDatasetSchema.safeParse({
    projectId,
    fileName,
    s3Key,
  });

  if (!validatedFields.success) {
    return {
      isSuccess: false,
      message: "Invalid input: " + validatedFields.error.errors[0]?.message,
    };
  }

  try {
    // 3. Authorization Check: Verify the user owns the project.
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, projectId),
          eq(projectsTable.userId, userId),
        ),
      );

    if (!project) {
      return {
        isSuccess: false,
        message: "Authorization Error: Project not found or you do not have permission.",
      };
    }

    // 4. Database Operation
    const [newDataset] = await db
      .insert(datasetsTable)
      .values({
        projectId,
        name: fileName,
        s3Key,
        // The status is 'uploading' by default in the schema. We can update it later.
        // For now, let's assume the upload was successful and set it to 'ready'.
        status: "ready",
      })
      .returning();

    // 5. Revalidation
    // Invalidate the cache for the project's datasets page to show the new data.
    revalidatePath(`/dashboard/projects/${projectId}/datasets`);

    return {
      isSuccess: true,
      message: `Dataset "${newDataset.name}" created successfully.`,
      data: newDataset,
    };
  } catch (error) {
    console.error("Error creating dataset record:", error);
    return {
      isSuccess: false,
      message: "Database Error: Failed to create dataset record.",
    };
  }
}

/**
 * Fetches all dataset records for a given project, ensuring the user has access.
 *
 * @param projectId - The ID of the project whose datasets are to be fetched.
 * @returns A promise that resolves to an `ActionState` containing the list of datasets or an error message.
 */
export async function getDatasetsForProjectAction(
  projectId: string,
): Promise<ActionState<SelectDataset[]>> {
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
    // First verify the user has access to this project
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, projectId),
          eq(projectsTable.userId, userId),
        ),
      );

    if (!project) {
      return {
        isSuccess: false,
        message: "Project not found or you do not have permission.",
      };
    }

    // Then fetch the datasets for the authorized project
    const datasets = await db
      .select()
      .from(datasetsTable)
      .where(eq(datasetsTable.projectId, projectId))
      .orderBy(desc(datasetsTable.createdAt));

    return {
      isSuccess: true,
      message: "Datasets fetched successfully.",
      data: datasets,
    };
  } catch (error) {
    console.error("Error fetching datasets:", error);
    return {
      isSuccess: false,
      message: "Database Error: Failed to fetch datasets.",
    };
  }
}

/**
 * Fetches a single dataset by its ID, ensuring it belongs to the current user's project.
 *
 * @param datasetId - The ID of the dataset to fetch.
 * @returns A promise that resolves to an `ActionState` containing the dataset or an error message.
 */
export async function getDatasetByIdAction(
  datasetId: string,
): Promise<ActionState<SelectDataset>> {
  const { userId } = auth();
  if (!userId) {
    return { isSuccess: false, message: "Unauthorized: You must be logged in." };
  }
  if (!datasetId) {
    return { isSuccess: false, message: "Invalid dataset ID." };
  }

  try {
    // This query joins the datasets table with the projects table to verify
    // that the dataset belongs to a project owned by the current user.
    const [result] = await db
      .select({
        id: datasetsTable.id,
        name: datasetsTable.name,
        s3Key: datasetsTable.s3Key,
        projectId: datasetsTable.projectId,
        status: datasetsTable.status,
        createdAt: datasetsTable.createdAt,
      })
      .from(datasetsTable)
      .innerJoin(projectsTable, eq(datasetsTable.projectId, projectsTable.id))
      .where(
        and(
          eq(datasetsTable.id, datasetId),
          eq(projectsTable.userId, userId),
        ),
      );

    if (!result) {
      return {
        isSuccess: false,
        message: "Dataset not found or you do not have permission.",
      };
    }

    return { isSuccess: true, message: "Dataset fetched successfully.", data: result };
  } catch (error) {
    console.error(`Error fetching dataset ${datasetId}:`, error);
    return { isSuccess: false, message: "Database Error: Failed to fetch dataset." };
  }
}
