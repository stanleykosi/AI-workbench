/**
 * @description
 * This file contains custom React Query hooks for project statistics.
 * These hooks provide intelligent caching for project-specific data.
 *
 * Key features:
 * - `useProjectStats`: Hook for fetching statistics for a single project
 * - `useMultipleProjectStats`: Hook for fetching statistics for multiple projects
 * - Intelligent caching with project-specific keys
 * - Background updates and error handling
 */

import { useQuery } from "@tanstack/react-query";
import {
  getProjectStatsAction,
  getMultipleProjectStatsAction,
  type ProjectStats
} from "@/actions/db";

// Query keys for React Query
export const projectStatsKeys = {
  all: ["projectStats"] as const,
  single: (projectId: string) => [...projectStatsKeys.all, "single", projectId] as const,
  multiple: (projectIds: string[]) => [...projectStatsKeys.all, "multiple", projectIds.sort()] as const,
};

/**
 * Hook for fetching statistics for a single project.
 * 
 * @param projectId - The ID of the project to get statistics for
 * @returns Query result with project statistics data
 */
export function useProjectStats(projectId: string) {
  return useQuery({
    queryKey: projectStatsKeys.single(projectId),
    queryFn: async () => {
      const result = await getProjectStatsAction(projectId);
      if (!result.isSuccess) {
        throw new Error(result.message);
      }
      return result.data;
    },
    // Keep project stats fresh for 3 minutes (they change when datasets/experiments are added)
    staleTime: 3 * 60 * 1000,
    // Cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Refetch every 5 minutes in background
    refetchInterval: 5 * 60 * 1000,
    // Only refetch when tab is visible
    refetchIntervalInBackground: false,
    // Only run query if projectId is provided
    enabled: !!projectId,
  });
}

/**
 * Hook for fetching statistics for multiple projects.
 * More efficient than multiple individual queries.
 * 
 * @param projectIds - Array of project IDs to get statistics for
 * @returns Query result with project statistics data for all projects
 */
export function useMultipleProjectStats(projectIds: string[]) {
  return useQuery({
    queryKey: projectStatsKeys.multiple(projectIds),
    queryFn: async () => {
      const result = await getMultipleProjectStatsAction(projectIds);
      if (!result.isSuccess) {
        throw new Error(result.message);
      }
      return result.data;
    },
    // Keep multiple project stats fresh for 3 minutes
    staleTime: 3 * 60 * 1000,
    // Cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Refetch every 5 minutes in background
    refetchInterval: 5 * 60 * 1000,
    // Only refetch when tab is visible
    refetchIntervalInBackground: false,
    // Only run query if projectIds are provided
    enabled: projectIds.length > 0,
  });
}

/**
 * Hook for getting statistics for a specific project from the multiple projects query.
 * Useful when you want to avoid multiple API calls but need individual project data.
 * 
 * @param projectIds - Array of all project IDs being fetched
 * @param targetProjectId - The specific project ID to extract stats for
 * @returns Project statistics for the target project, or undefined if not found
 */
export function useProjectStatsFromMultiple(
  projectIds: string[],
  targetProjectId: string
) {
  const { data: allStats, ...queryResult } = useMultipleProjectStats(projectIds);

  const targetStats = allStats?.find(stats => stats.projectId === targetProjectId);

  return {
    data: targetStats,
    ...queryResult,
  };
}
