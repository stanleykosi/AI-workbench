/**
 * @description
 * This component provides a skeleton loading state for the projects list page.
 * It is designed to be displayed as a fallback UI within a React Suspense boundary
 * while the actual project data is being fetched.
 *
 * Key features:
 * - Visual Placeholder: Mimics the structure of the final projects list, reducing layout shift
 *   and providing a better user experience.
 * - CSS Animations: Uses a subtle pulse animation to indicate that content is loading.
 * - Component-Based: Encapsulates the loading state UI into a reusable component.
 *
 * @dependencies
 * - @/components/ui/card: For creating the card-based layout that matches the final design.
 *
 * @notes
 * - The number of skeleton cards (e.g., 6) can be adjusted to better match the expected
 *   number of items per page.
 */
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * A single skeleton card component representing a loading project.
 * @returns {JSX.Element} The skeleton card.
 */
function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="h-6 w-3/5 animate-pulse rounded-md bg-muted" />
        <CardDescription className="mt-2 h-4 w-4/5 animate-pulse rounded-md bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-4 w-1/4 animate-pulse rounded-md bg-muted" />
      </CardContent>
    </Card>
  );
}

/**
 * Renders a grid of skeleton cards to represent the loading state of the projects list.
 *
 * @returns {JSX.Element} A grid of skeleton card components.
 */
export function ProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
