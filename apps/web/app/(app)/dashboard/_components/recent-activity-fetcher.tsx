/**
 * @description
 * This component fetches recent activity data from the database and passes it to the display component.
 * It's designed to be wrapped in a Suspense boundary for proper loading states.
 *
 * Key features:
 * - Server-side data fetching for recent activity
 * - Error handling with user-friendly messages
 * - Passes real data to the display component
 */

import { getRecentActivityAction } from "@/actions/db";
import { RecentActivityDisplay } from "./recent-activity";

/**
 * Fetches recent activity and renders the activity display.
 * This component is designed to be wrapped in a Suspense boundary.
 *
 * @returns A promise that resolves to the RecentActivityDisplay component with real data.
 */
export async function RecentActivityFetcher() {
  try {
    const { data: recentActivity, isSuccess, message } = await getRecentActivityAction(10);

    if (!isSuccess || !recentActivity) {
      // Fallback to showing empty state if there's an error, but log it
      console.error("Failed to fetch recent activity:", message);
      return (
        <RecentActivityDisplay
          activities={[]}
        />
      );
    }

    return <RecentActivityDisplay activities={recentActivity.activities} />;
  } catch (error) {
    console.error("Unexpected error fetching recent activity:", error);
    // Fallback to showing empty state if there's an unexpected error
    return (
      <RecentActivityDisplay
        activities={[]}
      />
    );
  }
}
