/**
 * @description
 * This is the main landing page for the AI Workbench application.
 * It serves as a visually engaging, public-facing entry point before a user logs in.
 *
 * Key features:
 * - A clean, modern design with a subtle gradient background.
 * - Professional typography to welcome the user.
 * - A clear call-to-action to guide users toward the application.
 *
 * @notes
 * - This component demonstrates the aesthetic potential of the configured Tailwind CSS.
 */
"use client";

import React from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <>
      <SignedIn>
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center space-x-4">
            <a
              href="/dashboard"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-100" />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl font-bold tracking-tighter text-gray-900 sm:text-5xl md:text-6xl">
              Welcome back to the AI Workbench
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-gray-600">
              You&apos;re signed in! Ready to continue building, testing, and deploying machine learning models for the Allora Network?
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/dashboard"
                className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </main>
      </SignedIn>
      <SignedOut>
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center space-x-4">
            <a
              href="/sign-in"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign In
            </a>
            <a
              href="/sign-up"
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Sign Up
            </a>
          </div>
        </div>
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-100" />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl font-bold tracking-tighter text-gray-900 sm:text-5xl md:text-6xl">
              Welcome to the AI Workbench
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-gray-600">
              The enterprise-grade platform to streamline the creation, testing, and
              deployment of machine learning models for the Allora Network.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/sign-in"
                className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Get started
              </a>
            </div>
          </div>
        </main>
      </SignedOut>
    </>
  );
}
