/**
 * @description
 * This file implements the user profile management page for the AI Workbench application.
 * It uses Clerk's pre-built `<UserProfile />` component, which allows authenticated users
 * to manage their account settings.
 *
 * Key features:
 * - Allows users to update their profile information (e.g., name, profile picture).
 * - Enables management of security settings, such as changing passwords and setting up
 *   multi-factor authentication.
 * - Provides an interface for managing connected accounts (e.g., social logins).
 * - Centered layout for a clean and focused user experience.
 *
 * @dependencies
 * - `@clerk/nextjs`: Provides the `<UserProfile />` component.
 *
 * @notes
 * - The file path `[[...user-profile]]` is a Next.js optional catch-all route,
 *   required by Clerk to handle the different sections of the user profile page.
 * - This page is intended to be accessed by authenticated users and should be protected
 *   by middleware. It is placed in the `(auth)` group for organizational consistency.
 */
"use client";

import { UserProfile } from "@clerk/nextjs";

/**
 * Renders the user profile page for the application.
 *
 * This component displays Clerk's `UserProfile` component, offering a full-featured
 * interface for users to manage their account settings.
 *
 * @returns {JSX.Element} The rendered user profile page component.
 */
export default function UserProfilePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12">
      <UserProfile />
    </div>
  );
}
