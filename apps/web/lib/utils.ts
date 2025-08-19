/**
 * @description
 * This file provides utility functions for the web application, primarily for styling.
 *
 * Key features:
 * - `cn`: A utility function that merges Tailwind CSS classes. It combines the power of `clsx`
 *   for conditional classes and `tailwind-merge` to resolve conflicting classes gracefully.
 *
 * @dependencies
 * - `clsx`: For constructing class name strings conditionally.
 * - `tailwind-merge`: For merging Tailwind CSS classes without style conflicts.
 *
 * @notes
 * - This function is a cornerstone of building components with `shadcn/ui` and is used
 *   extensively throughout the application to manage component styles.
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
