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
import { Header, HeroSection, Footer } from "@/components/ui";

export default function HomePage() {
  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-white">
          <Header />
          <main className="pt-20">
            <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white">
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
                    className="rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-white">
          <Header />
          <HeroSection />
          <Footer />
        </div>
      </SignedOut>
    </>
  );
}
