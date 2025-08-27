/**
 * @description
 * This file contains custom React Query hooks for dashboard data.
 * These hooks provide intelligent caching, background updates, and error handling.
 *
 * Key features:
 * - `useDashboardCounts`: Hook for fetching dashboard statistics
 * - `useRecentActivity`: Hook for fetching recent activity timeline
 * - Automatic caching with smart invalidation
 * - Background refetching for real-time updates
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDashboardCountsAction, getRecentActivityAction } from "@/actions/db";

// Query keys for React Query
export const dashboardKeys = {
  all: ["dashboard"] as const,
  counts: () => [...dashboardKeys.all, "counts"] as const,
  recentActivity: (limit?: number) => [...dashboardKeys.all, "recentActivity", limit] as const,
};

/**
 * Hook for fetching dashboard counts (projects, datasets, experiments, deployments)
 * 
 * @returns Query result with dashboard counts data
 */
export function useDashboardCounts() {
  return useQuery({
    queryKey: dashboardKeys.counts(),
    queryFn: async () => {
      const result = await getDashboardCountsAction();
      if (!result.isSuccess) {
        throw new Error(result.message);
      }
      return result.data;
    },
    // Keep counts fresh for 2 minutes (they don't change as frequently)
    staleTime: 2 * 60 * 1000,
    // Cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Refetch every 5 minutes in background
    refetchInterval: 5 * 60 * 1000,
    // Only refetch when tab is visible
    refetchIntervalInBackground: false,
  });
}

/**
 * Hook for fetching recent activity timeline
 * 
 * @param limit - Maximum number of activities to fetch (default: 10)
 * @returns Query result with recent activity data
 */
export function useRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: dashboardKeys.recentActivity(limit),
    queryFn: async () => {
      const result = await getRecentActivityAction(limit);
      if (!result.isSuccess) {
        throw new Error(result.message);
      }
      return result.data;
    },
    // Keep activity fresh for 1 minute (more dynamic)
    staleTime: 1 * 60 * 1000,
    // Cache for 3 minutes
    gcTime: 3 * 60 * 1000,
    // Refetch every 2 minutes in background
    refetchInterval: 2 * 60 * 1000,
    // Only refetch when tab is visible
    refetchIntervalInBackground: false,
  });
}

/**
 * Hook for prefetching dashboard data
 * Useful for prefetching data before navigation
 */
export function usePrefetchDashboardData() {
  const queryClient = useQueryClient();

  return {
    prefetchCounts: () => {
      queryClient.prefetchQuery({
        queryKey: dashboardKeys.counts(),
        queryFn: async () => {
          const result = await getDashboardCountsAction();
          if (!result.isSuccess) {
            throw new Error(result.message);
          }
          return result.data;
        },
      });
    },
    prefetchRecentActivity: (limit: number = 10) => {
      queryClient.prefetchQuery({
        queryKey: dashboardKeys.recentActivity(limit),
        queryFn: async () => {
          const result = await getRecentActivityAction(limit);
          if (!result.isSuccess) {
            throw new Error(result.message);
          }
          return result.data;
        },
      });
    },
  };
}
