/**
 * @description
 * This file contains the Server Actions for fetching dashboard statistics and counts.
 * These actions provide aggregated data for the main dashboard view.
 *
 * Key features:
 * - `getDashboardCountsAction`: Fetches counts for projects, datasets, experiments, and deployments.
 *
 * @dependencies
 * - `@clerk/nextjs/server`: For `auth()` to get user and session details.
 * - `drizzle-orm`: For database query operators and counting.
 * - `@/db`: The Drizzle ORM client instance.
 * - `@/db/schema`: The database table definitions.
 * - `@repo/types`: The shared `ActionState` type for consistent action responses.
 */
"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq, count } from "drizzle-orm";

import { db } from "@/db";
import {
  projectsTable,
  datasetsTable,
  experimentsTable,
  deploymentsTable
} from "@/db/schema";
import { type ActionState } from "@repo/types";

export interface DashboardCounts {
  projects: number;
  datasets: number;
  experiments: number;
  deployments: number;
}

/**
 * Fetches dashboard counts for the current user.
 * Returns counts for projects, datasets, experiments, and deployments.
 *
 * @returns A promise that resolves to an `ActionState` containing the dashboard counts or an error message.
 */
export async function getDashboardCountsAction(): Promise<ActionState<DashboardCounts>> {
  const { userId } = auth();

  // 1. Authentication Check
  if (!userId) {
    return {
      isSuccess: false,
      message: "Unauthorized: You must be logged in to view dashboard counts.",
    };
  }

  try {
    // 2. Database Queries with Authorization
    // All queries ensure the user only sees their own data

    // Count projects
    const [projectsResult] = await db
      .select({ count: count() })
      .from(projectsTable)
      .where(eq(projectsTable.userId, userId));

    // Count datasets (join with projects to ensure user ownership)
    const [datasetsResult] = await db
      .select({ count: count() })
      .from(datasetsTable)
      .innerJoin(projectsTable, eq(datasetsTable.projectId, projectsTable.id))
      .where(eq(projectsTable.userId, userId));

    // Count experiments (join with projects to ensure user ownership)
    const [experimentsResult] = await db
      .select({ count: count() })
      .from(experimentsTable)
      .innerJoin(projectsTable, eq(experimentsTable.projectId, projectsTable.id))
      .where(eq(projectsTable.userId, userId));

    // Count deployments (join with experiments and projects to ensure user ownership)
    const [deploymentsResult] = await db
      .select({ count: count() })
      .from(deploymentsTable)
      .innerJoin(experimentsTable, eq(deploymentsTable.experimentId, experimentsTable.id))
      .innerJoin(projectsTable, eq(experimentsTable.projectId, projectsTable.id))
      .where(eq(projectsTable.userId, userId));

    const counts: DashboardCounts = {
      projects: projectsResult?.count || 0,
      datasets: datasetsResult?.count || 0,
      experiments: experimentsResult?.count || 0,
      deployments: deploymentsResult?.count || 0,
    };

    return {
      isSuccess: true,
      message: "Dashboard counts fetched successfully.",
      data: counts,
    };
  } catch (error) {
    console.error("Error fetching dashboard counts:", error);
    return {
      isSuccess: false,
      message: "Database Error: Failed to fetch dashboard counts. Please try again.",
    };
  }
}
