/**
 * @description
 * This file defines the primary layout for the authenticated section of the application,
 * encompassing all routes under the `/dashboard` path. It establishes the core visual
 * structure, including a persistent sidebar for navigation and a header for user-specific
 * controls.
 *
 * Key features:
 * - A two-column layout featuring a fixed sidebar and a scrollable main content area.
 * - Integration of the `Sidebar` and `Header` components to provide consistent navigation
 *   and user management across all authenticated pages.
 * - The main content area is designed to be responsive and provides consistent padding
 *   for all nested pages and layouts.
 *
 * @dependencies
 * - @/components/layout/header: The header component containing user controls.
 * - @/components/layout/sidebar: The navigation sidebar component.
 *
 * @notes
 * - This layout is applied to all routes within the `(app)/dashboard` directory group.
 * - It assumes that access to this layout is protected by the Clerk authentication middleware.
 */
"use client";

import React, { useEffect } from "react";
import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

/**
 * Renders the main layout for the authenticated dashboard area.
 *
 * @param {Readonly<{ children: React.ReactNode }>} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the main content area.
 * @returns {JSX.Element} The rendered dashboard layout component.
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-secondary">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
