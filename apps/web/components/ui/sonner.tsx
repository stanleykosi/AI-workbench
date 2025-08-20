/**
 * @description
 * This file provides a styled toast notification component using the `sonner` library,
 * customized to match the application's design system defined by shadcn/ui.
 *
 * Key features:
 * - Provides a clean, simple, and non-intrusive way to display notifications.
 * - The styling is fully consistent with the rest of the UI, using Tailwind CSS variables.
 * - Supports different toast types (success, info, warning, error) with distinct styling.
 *
 * @dependencies
 * - `sonner`: The underlying toast notification library.
 *
 * @notes
 * - The `<Toaster />` component should be placed once in the root layout of the application
 *   to enable toast notifications globally. To trigger a toast, import and use the `toast()`
 *   function from `sonner` in any client component.
 */
"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // Although the app is light-mode only for now, using useTheme is good practice
  // for potential future theme support. It defaults gracefully if no theme provider is found.
  const { theme = "system" } = useTheme() ?? {};

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
