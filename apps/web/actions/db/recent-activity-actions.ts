/**
 * @description
 * This file contains the Server Actions for fetching recent activity data.
 * These actions provide a timeline of user activity for the dashboard.
 *
 * Key features:
 * - `getRecentActivityAction`: Fetches recent activity across all user entities.
 *
 * @dependencies
 * - `@clerk/nextjs/server`: For `auth()` to get user and session details.
 * - `drizzle-orm`: For database query operators and joins.
 * - `@/db`: The Drizzle ORM client instance.
 * - `@/db/schema`: The database table definitions.
 * - `@repo/types`: The shared `ActionState` type for consistent action responses.
 */
"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq, desc } from "drizzle-orm";

import { db } from "@/db";
import {
  projectsTable,
  datasetsTable,
  experimentsTable,
  deploymentsTable
} from "@/db/schema";
import { type ActionState } from "@repo/types";

export interface ActivityItem {
  id: string;
  type: 'project' | 'dataset' | 'experiment' | 'deployment';
  title: string;
  description: string;
  status?: string;
  createdAt: Date;
  projectId?: string;
  projectName?: string;
}

export interface RecentActivity {
  activities: ActivityItem[];
  totalCount: number;
}

/**
 * Fetches recent activity for the current user across all entities.
 * Returns a timeline of recent projects, datasets, experiments, and deployments.
 *
 * @param limitCount - Maximum number of activities to return (default: 10)
 * @returns A promise that resolves to an `ActionState` containing recent activity or an error message.
 */
export async function getRecentActivityAction(
  limitCount: number = 10
): Promise<ActionState<RecentActivity>> {
  const { userId } = auth();

  // 1. Authentication Check
  if (!userId) {
    return {
      isSuccess: false,
      message: "Unauthorized: You must be logged in to view recent activity.",
    };
  }

  try {
    // 2. Database Queries with Authorization
    // All queries ensure the user only sees their own data

    // Get recent projects
    const recentProjects = await db
      .select({
        id: projectsTable.id,
        name: projectsTable.name,
        createdAt: projectsTable.createdAt,
      })
      .from(projectsTable)
      .where(eq(projectsTable.userId, userId))
      .orderBy(desc(projectsTable.createdAt));

    // Get recent datasets with project names
    const recentDatasets = await db
      .select({
        id: datasetsTable.id,
        name: datasetsTable.name,
        createdAt: datasetsTable.createdAt,
        projectId: datasetsTable.projectId,
        projectName: projectsTable.name,
      })
      .from(datasetsTable)
      .innerJoin(projectsTable, eq(datasetsTable.projectId, projectsTable.id))
      .where(eq(projectsTable.userId, userId))
      .orderBy(desc(datasetsTable.createdAt));

    // Get recent experiments with project names
    const recentExperiments = await db
      .select({
        id: experimentsTable.id,
        modelConfig: experimentsTable.modelConfig,
        status: experimentsTable.status,
        createdAt: experimentsTable.createdAt,
        projectId: experimentsTable.projectId,
        projectName: projectsTable.name,
      })
      .from(experimentsTable)
      .innerJoin(projectsTable, eq(experimentsTable.projectId, projectsTable.id))
      .where(eq(projectsTable.userId, userId))
      .orderBy(desc(experimentsTable.createdAt));

    // Get recent deployments with project and experiment info
    const recentDeployments = await db
      .select({
        id: deploymentsTable.id,
        status: deploymentsTable.status,
        createdAt: deploymentsTable.createdAt,
        projectId: experimentsTable.projectId,
        projectName: projectsTable.name,
        modelConfig: experimentsTable.modelConfig,
      })
      .from(deploymentsTable)
      .innerJoin(experimentsTable, eq(deploymentsTable.experimentId, experimentsTable.id))
      .innerJoin(projectsTable, eq(experimentsTable.projectId, projectsTable.id))
      .where(eq(projectsTable.userId, userId))
      .orderBy(desc(deploymentsTable.createdAt));

    // 3. Transform and combine all activities
    const allActivities: ActivityItem[] = [];

    // Add projects
    recentProjects.forEach(project => {
      allActivities.push({
        id: project.id,
        type: 'project',
        title: project.name,
        description: 'Project created',
        createdAt: project.createdAt,
        projectId: project.id,
        projectName: project.name,
      });
    });

    // Add datasets
    recentDatasets.forEach(dataset => {
      allActivities.push({
        id: dataset.id,
        type: 'dataset',
        title: dataset.name,
        description: 'Dataset uploaded',
        createdAt: dataset.createdAt,
        projectId: dataset.projectId,
        projectName: dataset.projectName,
      });
    });

    // Add experiments
    recentExperiments.forEach(experiment => {
      const modelConfig = experiment.modelConfig as any;
      const modelName = modelConfig?.modelName || 'Unknown Model';
      allActivities.push({
        id: experiment.id,
        type: 'experiment',
        title: `${modelName} Experiment`,
        description: `Experiment ${experiment.status}`,
        status: experiment.status,
        createdAt: experiment.createdAt,
        projectId: experiment.projectId,
        projectName: experiment.projectName,
      });
    });

    // Add deployments
    recentDeployments.forEach(deployment => {
      const modelConfig = deployment.modelConfig as any;
      const modelName = modelConfig?.modelName || 'Unknown Model';
      allActivities.push({
        id: deployment.id,
        type: 'deployment',
        title: `${modelName} Deployment`,
        description: `Deployment ${deployment.status}`,
        status: deployment.status,
        createdAt: deployment.createdAt,
        projectId: deployment.projectId,
        projectName: deployment.projectName,
      });
    });

    // 4. Sort all activities by creation date (most recent first)
    allActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 5. Limit to requested count
    const limitedActivities = allActivities.slice(0, limitCount);

    const recentActivity: RecentActivity = {
      activities: limitedActivities,
      totalCount: limitedActivities.length,
    };

    return {
      isSuccess: true,
      message: "Recent activity fetched successfully.",
      data: recentActivity,
    };
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return {
      isSuccess: false,
      message: "Database Error: Failed to fetch recent activity. Please try again.",
    };
  }
}
