/**
 * @description
 * This file implements the user sign-in page for the AI Workbench application.
 * It leverages Clerk's pre-built `<SignIn />` component to provide a secure and
 * feature-rich authentication experience out of the box.
 *
 * Key features:
 * - Renders a complete sign-in form.
 * - Supports various authentication methods (e.g., email/password, social providers).
 * - Handles all aspects of the sign-in flow, including multi-factor authentication.
 * - Centered layout for a clean and focused user interface.
 *
 * @dependencies
 * - `@clerk/nextjs`: Provides the `<SignIn />` component for user authentication.
 *
 * @notes
 * - The file path `[[...sign-in]]` is a Next.js convention for an optional catch-all route,
 *   which is required by Clerk to handle all authentication-related sub-routes and flows.
 * - This page is part of the `(auth)` route group, which can be used to apply specific
 *   layouts or middleware to authentication-related pages.
 */
"use client";

import { SignIn } from "@clerk/nextjs";

/**
 * Renders the sign-in page for the application.
 *
 * This component displays Clerk's `SignIn` component, which provides a
 * complete and customizable sign-in user interface.
 *
 * @returns {JSX.Element} The rendered sign-in page component.
 */
export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12">
      <SignIn redirectUrl="/dashboard" />
    </div>
  );
}
