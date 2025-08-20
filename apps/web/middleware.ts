/**
 * @description
 * This file configures the authentication middleware for the Next.js application using Clerk.
 * It uses the official clerkMiddleware() pattern for route protection.
 *
 * @dependencies
 * - @clerk/nextjs/server: Provides the `clerkMiddleware` function.
 */
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
