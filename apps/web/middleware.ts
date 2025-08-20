/**
 * @description
 * This file configures the authentication middleware for the Next.js application using Clerk.
 * It is responsible for protecting routes and managing public and private access.
 *
 * Key features:
 * - `createRouteMatcher`: Used to define which routes are protected. In this case,
 *   all routes under `/dashboard` require authentication.
 * - `clerkMiddleware`: The core middleware function that handles session validation
 *   and redirects unauthenticated users.
 * - `config.matcher`: A Next.js configuration object that specifies which paths
 *   the middleware should run on, optimizing performance by excluding static assets.
 *
 * @dependencies
 * - @clerk/nextjs/server: Provides the `clerkMiddleware` and `createRouteMatcher` functions.
 *
 * @notes
 * - The order of operations is critical: the matcher first identifies protected routes,
 *   and then the middleware calls `auth().protect()` for those specific routes.
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
