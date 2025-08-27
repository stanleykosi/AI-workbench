/**
 * @description
 * This component fetches dashboard counts from the database and passes them to the display component.
 * It's designed to be wrapped in a Suspense boundary for proper loading states.
 *
 * Key features:
 * - Server-side data fetching for dashboard statistics
 * - Error handling with user-friendly messages
 * - Passes real data to the display component
 */

import { getDashboardCountsAction } from "@/actions/db";
import { DashboardStatsDisplay } from "./dashboard-stats";

/**
 * Fetches dashboard counts and renders the stats display.
 * This component is designed to be wrapped in a Suspense boundary.
 *
 * @returns A promise that resolves to the DashboardStatsDisplay component with real data.
 */
export async function DashboardStatsFetcher() {
  try {
    const { data: counts, isSuccess, message } = await getDashboardCountsAction();

    if (!isSuccess || !counts) {
      // Fallback to showing 0s if there's an error, but log it
      console.error("Failed to fetch dashboard counts:", message);
      return (
        <DashboardStatsDisplay
          counts={{
            projects: 0,
            datasets: 0,
            experiments: 0,
            deployments: 0,
          }}
        />
      );
    }

    return <DashboardStatsDisplay counts={counts} />;
  } catch (error) {
    console.error("Unexpected error fetching dashboard counts:", error);
    // Fallback to showing 0s if there's an unexpected error
    return (
      <DashboardStatsDisplay
        counts={{
          projects: 0,
          datasets: 0,
          experiments: 0,
          deployments: 0,
        }}
      />
    );
  }
}
