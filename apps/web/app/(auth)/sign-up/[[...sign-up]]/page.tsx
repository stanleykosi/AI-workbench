/**
 * @description
 * This file implements the user sign-up page for the AI Workbench application.
 * It utilizes Clerk's pre-built `<SignUp />` component to offer a seamless and
 * secure user registration flow.
 *
 * Key features:
 * - Renders a complete sign-up form.
 * - Supports various registration methods, including email/password and social providers.
 * - Manages the entire sign-up process, including email verification.
 * - Centered layout for a consistent and user-friendly experience.
 *
 * @dependencies
 * - `@clerk/nextjs`: Provides the `<SignUp />` component for user registration.
 *
 * @notes
 * - The file path `[[...sign-up]]` is a Next.js convention for an optional catch-all route,
 *   which is required by Clerk to correctly handle all parts of the registration flow.
 * - This page belongs to the `(auth)` route group, isolating it with other authentication pages.
 */
"use client";

import { SignUp } from "@clerk/nextjs";

/**
 * Renders the sign-up page for the application.
 *
 * This component displays Clerk's `SignUp` component, which provides a
 * complete and customizable user registration interface.
 *
 * @returns {JSX.Element} The rendered sign-up page component.
 */
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12">
      <SignUp redirectUrl="/dashboard" />
    </div>
  );
}
