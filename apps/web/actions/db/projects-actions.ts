/**
 * @description
 * This file contains the Server Actions for managing projects. These actions
 * handle the business logic for creating and fetching projects, including
 * authentication checks, input validation, and database operations using Drizzle ORM.
 *
 * Key features:
 * - `createProjectAction`: Handles the creation of a new project, linked to the
 *   currently authenticated user and their active organization.
 * - `getProjectsAction`: Fetches all projects associated with the user's active
 *   organization.
 *
 * @dependencies
 * - `next/cache`: For `revalidatePath` to update the UI upon data mutation.
 * - `@clerk/nextjs/server`: For `auth()` to get user and organization details.
 * - `drizzle-orm`: For database query operators like `eq`.
 * - `zod`: For robust schema-based input validation.
 * - `@/db`: The Drizzle ORM client instance.
 * - `@/db/schema`: The database table definitions.
 * - `@repo/types`: The shared `ActionState` type for consistent action responses.
 */
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { projectsTable, type SelectProject } from "@/db/schema";
import { type ActionState } from "@repo/types";

// Schema for form validation using Zod.
// This ensures the project name is a non-empty string.
const CreateProjectSchema = z.object({
  name: z.string().min(1, { message: "Project name cannot be empty." }),
});

/**
 * Creates a new project in the database for the current user's active organization.
 * This action is designed to be used with a form and the `useFormState` hook.
 *
 * @param prevState - The previous state of the form action (required by `useFormState` but unused here).
 * @param formData - The `FormData` object submitted by the user's form.
 * @returns A promise that resolves to an `ActionState` object indicating success or failure.
 */
export async function createProjectAction(
  prevState: any,
  formData: FormData,
): Promise<ActionState<SelectProject>> {
  const { userId, orgId } = auth();

  // 1. Authentication & Authorization Check
  // Ensure the user is logged in before proceeding.
  if (!userId) {
    return {
      isSuccess: false,
      message: "Unauthorized: You must be logged in to create a project.",
    };
  }
  // Ensure the user has an active organization, as projects are scoped to organizations.
  if (!orgId) {
    return {
      isSuccess: false,
      message:
        "No active organization: You must create or join an organization to create a project.",
    };
  }

  // 2. Input Validation
  // Validate the form data against the Zod schema.
  const validatedFields = CreateProjectSchema.safeParse({
    name: formData.get("projectName"),
  });

  // If validation fails, return an error message.
  if (!validatedFields.success) {
    const errorMessage =
      validatedFields.error.errors[0]?.message ?? "Invalid input.";
    return {
      isSuccess: false,
      message: errorMessage,
    };
  }

  const { name } = validatedFields.data;

  // 3. Database Operation
  try {
    // Insert the new project into the database, associating it with the user and organization.
    const [newProject] = await db
      .insert(projectsTable)
      .values({
        name,
        userId,
        organizationId: orgId,
      })
      .returning();

    // 4. Revalidation & Success Response
    // Invalidate the cache for the projects page to ensure the UI is updated with the new project.
    revalidatePath("/dashboard/projects");

    return {
      isSuccess: true,
      message: `Project "${newProject.name}" created successfully.`,
      data: newProject,
    };
  } catch (error) {
    console.error("Error creating project:", error);
    // Handle potential database errors, such as unique constraint violations.
    return {
      isSuccess: false,
      message: "Database Error: Failed to create the project. Please try again.",
    };
  }
}

/**
 * Fetches all projects associated with the current user's active organization.
 *
 * @returns A promise that resolves to an `ActionState` object containing the list of projects or an error.
 */
export async function getProjectsAction(): Promise<ActionState<SelectProject[]>> {
  const { userId, orgId } = auth();

  // 1. Authentication & Authorization Check
  if (!userId) {
    return {
      isSuccess: false,
      message: "Unauthorized: You must be logged in to view projects.",
    };
  }
  // If the user is not part of an organization, it's not an error.
  // Simply return an empty list of projects.
  if (!orgId) {
    return {
      isSuccess: true,
      message: "No active organization found.",
      data: [],
    };
  }

  // 2. Database Operation
  try {
    // Fetch all projects from the database that match the user's active organization ID.
    const projects = await db.query.projectsTable.findMany({
      where: eq(projectsTable.organizationId, orgId),
      orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    });

    return {
      isSuccess: true,
      message: "Projects fetched successfully.",
      data: projects,
    };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return {
      isSuccess: false,
      message: "Database Error: Failed to fetch projects. Please try again.",
    };
  }
}
