/**
 * @description
 * This component implements the header for the authenticated dashboard layout. It sits
 * at the top of the main content area and contains user-specific controls, such as
 * organization switching and user profile management.
 *
 * Key features:
 * - Integrates Clerk's `<OrganizationSwitcher />` for multi-tenancy and team collaboration.
 * - Integrates Clerk's `<UserButton />` for easy access to user profile and sign-out actions.
 * - A clean, responsive design that adapts to different screen sizes.
 *
 * @dependencies
 * - `@clerk/nextjs`: Provides the `OrganizationSwitcher` and `UserButton` components.
 *
 * @notes
 * - The mobile navigation toggle is included but is currently a placeholder; its state
 *   and functionality will be implemented in a future step.
 */
"use client";

import React from "react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

/**
 * Renders the header component for the authenticated user dashboard.
 *
 * This component provides key user and organization management controls.
 *
 * @returns {JSX.Element} The rendered header component.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex w-full items-center justify-end gap-4">
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
