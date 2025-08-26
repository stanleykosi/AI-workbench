/**
 * @description
 * This file initializes and exports a singleton instance of the Temporal WorkflowClient.
 * This client is the primary interface for interacting with the Temporal cluster from
 * the Next.js backend (i.e., within Server Actions).
 *
 * Key features:
 * - Singleton Pattern: Ensures that only one instance of the client and one connection
 *   to the Temporal server is created and reused across the application, which is
 *   critical for performance and resource management in a serverless environment.
 * - Lazy Connection: The `Connection.lazy()` method defers the establishment of a
 *   gRPC connection until the first request is made, preventing connection overhead
 *   during server startup.
 * - Environment-based Configuration: The Temporal server address is configured via
 *   an environment variable (`TEMPORAL_SERVER_URL`), allowing for different configurations
 *   between local development (e.g., 'localhost:7233') and production.
 *
 * @dependencies
 * - `@temporalio/client`: The official Temporal client library for TypeScript.
 *
 * @notes
 * - This module is intended to be used exclusively in server-side code (e.g., Server Actions).
 * - The `TEMPORAL_SERVER_URL` environment variable must be set in your `.env.local` file.
 */
import { Client, Connection } from "@temporalio/client";

// Ensure the environment variable is set, throwing an error if it's not.
// This prevents runtime errors in environments where the variable is missing.
if (!process.env.TEMPORAL_SERVER_URL) {
  throw new Error("Missing environment variable: TEMPORAL_SERVER_URL");
}

// In production (Vercel), require namespace and API key for Temporal Cloud
if (process.env.NODE_ENV === "production") {
  if (!process.env.TEMPORAL_NAMESPACE) {
    throw new Error("Missing environment variable: TEMPORAL_NAMESPACE");
  }
  if (!process.env.TEMPORAL_API_KEY) {
    throw new Error("Missing environment variable: TEMPORAL_API_KEY");
  }
}

// Type definition for the global object to include our singleton client.
// This helps with TypeScript type checking for the global cache.
declare global {
  // eslint-disable-next-line no-var
  var temporalClient: Client | undefined;
}

// Singleton implementation for the Temporal Client.
// This pattern checks if a client instance already exists on the global object.
// If it does, it's reused. If not, a new one is created. This is essential
// in a development environment where hot-reloading can cause modules to be re-evaluated.
const temporalClient: Client =
  globalThis.temporalClient ??
  new Client({
    connection: Connection.lazy({
      address: process.env.TEMPORAL_SERVER_URL,
      // For Temporal Cloud, enable TLS and pass API key when provided
      ...(process.env.TEMPORAL_API_KEY
        ? { tls: {}, apiKey: process.env.TEMPORAL_API_KEY }
        : {}),
    }),
    // Namespace: use provided or default for local dev
    namespace: process.env.TEMPORAL_NAMESPACE || "default",
  });

// In a non-production environment, we assign the client to the global object.
if (process.env.NODE_ENV !== "production") {
  globalThis.temporalClient = temporalClient;
}

export { temporalClient };
