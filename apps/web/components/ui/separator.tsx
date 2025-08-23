/**
 * @description
 * This file provides a styled, reusable Separator component based on shadcn/ui.
 * It is built on top of Radix UI's accessible Separator primitive and is used to
 * visually separate content.
 *
 * Key features:
 * - Can be oriented horizontally or vertically.
 * - Styled with Tailwind CSS to match the application's design system.
 * - Fully accessible.
 *
 * @dependencies
 * - `react`: The core React library.
 * - `@radix-ui/react-separator`: The underlying accessible component primitive.
 * - `@/lib/utils`: The `cn` utility for merging Tailwind CSS classes.
 */
"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref,
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };


