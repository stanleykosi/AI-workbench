/**
 * @description
 * This component provides a skeleton loading state for the datasets list.
 * It is intended to be used as a fallback UI in a React Suspense boundary.
 *
 * Key features:
 * - Visual Placeholder: Mimics the final card-based layout of the dataset list,
 *   preventing layout shift when the real data loads.
 * - CSS Animations: Uses a subtle pulse animation on placeholder elements to
 *   clearly indicate a loading state.
 * - Reusability: Encapsulates the skeleton UI into a clean, reusable component.
 *
 * @dependencies
 * - @/components/ui/card: Used to create the skeleton card structure, ensuring
 *   visual consistency with the final rendered list.
 */
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

/**
 * A single skeleton card component that mimics the appearance of a dataset card.
 * @returns {JSX.Element} The skeleton card.
 */
function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="h-6 w-3/5 animate-pulse rounded-md bg-muted" />
        <CardDescription className="mt-2 h-4 w-4/5 animate-pulse rounded-md bg-muted" />
      </CardHeader>
    </Card>
  );
}

/**
 * Renders a grid of skeleton cards to represent the loading state of the datasets list.
 *
 * @returns {JSX.Element} A grid of skeleton card components.
 */
export function DatasetsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
