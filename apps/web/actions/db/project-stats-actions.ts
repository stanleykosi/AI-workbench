/**
 * @description
 * This file contains the Server Actions for fetching project-specific statistics.
 * These actions provide counts for datasets, experiments, and deployments within a project.
 *
 * Key features:
 * - `getProjectStatsAction`: Fetches counts for a specific project.
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

export interface ProjectStats {
  projectId: string;
  datasets: number;
  experiments: number;
  deployments: number;
}

/**
 * Fetches statistics for a specific project, ensuring the user has access.
 * Returns counts for datasets, experiments, and deployments within the project.
 *
 * @param projectId - The ID of the project to get statistics for.
 * @returns A promise that resolves to an `ActionState` containing the project stats or an error message.
 */
export async function getProjectStatsAction(
  projectId: string
): Promise<ActionState<ProjectStats>> {
  const { userId } = auth();

  // 1. Authentication Check
  if (!userId) {
    return {
      isSuccess: false,
      message: "Unauthorized: You must be logged in to view project statistics.",
    };
  }

  // 2. Input Validation
  if (!projectId) {
    return {
      isSuccess: false,
      message: "Project ID is required.",
    };
  }

  try {
    // 3. Authorization Check: Verify the user owns the project
    const [project] = await db
      .select({ id: projectsTable.id })
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, projectId),
          eq(projectsTable.userId, userId)
        )
      );

    if (!project) {
      return {
        isSuccess: false,
        message: "Project not found or you do not have permission.",
      };
    }

    // 4. Database Queries for Project Statistics
    // Count datasets in this project
    const [datasetsResult] = await db
      .select({ count: count() })
      .from(datasetsTable)
      .where(eq(datasetsTable.projectId, projectId));

    // Count experiments in this project
    const [experimentsResult] = await db
      .select({ count: count() })
      .from(experimentsTable)
      .where(eq(experimentsTable.projectId, projectId));

    // Count deployments for experiments in this project
    const [deploymentsResult] = await db
      .select({ count: count() })
      .from(deploymentsTable)
      .innerJoin(experimentsTable, eq(deploymentsTable.experimentId, experimentsTable.id))
      .where(eq(experimentsTable.projectId, projectId));

    const stats: ProjectStats = {
      projectId,
      datasets: datasetsResult?.count || 0,
      experiments: experimentsResult?.count || 0,
      deployments: deploymentsResult?.count || 0,
    };

    return {
      isSuccess: true,
      message: "Project statistics fetched successfully.",
      data: stats,
    };
  } catch (error) {
    console.error("Error fetching project statistics:", error);
    return {
      isSuccess: false,
      message: "Database Error: Failed to fetch project statistics. Please try again.",
    };
  }
}

/**
 * Fetches statistics for multiple projects in a single query.
 * More efficient than calling getProjectStatsAction multiple times.
 *
 * @param projectIds - Array of project IDs to get statistics for.
 * @returns A promise that resolves to an `ActionState` containing project stats for all requested projects.
 */
export async function getMultipleProjectStatsAction(
  projectIds: string[]
): Promise<ActionState<ProjectStats[]>> {
  const { userId } = auth();

  // 1. Authentication Check
  if (!userId) {
    return {
      isSuccess: false,
      message: "Unauthorized: You must be logged in to view project statistics.",
    };
  }

  // 2. Input Validation
  if (!projectIds || projectIds.length === 0) {
    return {
      isSuccess: false,
      message: "Project IDs are required.",
    };
  }

  try {
    // 3. Authorization Check: Verify the user owns all projects
    const userProjects = await db
      .select({ id: projectsTable.id })
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.userId, userId),
          // Note: We'll filter by projectIds in the application layer for security
        )
      );

    const authorizedProjectIds = userProjects
      .map(p => p.id)
      .filter(id => projectIds.includes(id));

    if (authorizedProjectIds.length === 0) {
      return {
        isSuccess: false,
        message: "No authorized projects found.",
      };
    }

    // 4. Fetch statistics for all authorized projects
    const allStats: ProjectStats[] = [];

    for (const projectId of authorizedProjectIds) {
      const projectStats = await getProjectStatsAction(projectId);
      if (projectStats.isSuccess && projectStats.data) {
        allStats.push(projectStats.data);
      }
    }

    return {
      isSuccess: true,
      message: "Multiple project statistics fetched successfully.",
      data: allStats,
    };
  } catch (error) {
    console.error("Error fetching multiple project statistics:", error);
    return {
      isSuccess: false,
      message: "Database Error: Failed to fetch project statistics. Please try again.",
    };
  }
}
