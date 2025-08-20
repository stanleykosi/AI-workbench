/**
 * @description
 * This file contains the Progress component from shadcn/ui. It is a client component
 * used to display a progress bar, which is essential for indicating the status of
 * long-running operations like file uploads.
 *
 * Key features:
 * - Visually represents progress from 0% to 100%.
 * - Built on top of Radix UI's accessible Progress primitive.
 * - Customizable styling via Tailwind CSS.
 *
 * @dependencies
 * - `react`: The core React library.
 * - `@radix-ui/react-progress`: The underlying accessible component primitive.
 * - `@/lib/utils`: The `cn` utility for merging Tailwind CSS classes.
 *
 * @notes
 * - The progress is controlled by the `value` prop, which should be a number between 0 and 100.
 */
"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
