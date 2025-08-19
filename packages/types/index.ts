/**
 * @description
 * This file defines shared TypeScript types and interfaces for use across the AI Workbench monorepo.
 * Centralizing types ensures consistency between the frontend (Next.js app) and backend services (Server Actions).
 *
 * Key features:
 * - `ActionState<T>`: A standardized interface for the return value of all Server Actions.
 *   This provides a consistent structure for handling success states, error messages, and optional data payloads.
 *
 * @notes
 * - This package is intended to have no runtime dependencies. It should only contain type definitions.
 */

/**
 * A generic interface for Server Action return values.
 * This structure is crucial for handling form state and API responses in client components.
 *
 * @template T The type of the data payload returned on success.
 *
 * @property {boolean} isSuccess - Indicates whether the action was successful. `true` for success, `false` for failure.
 * @property {string} message - A descriptive message about the outcome of the action, useful for user feedback.
 * @property {T} [data] - An optional payload containing the result of a successful action. It is undefined on failure.
 */
export interface ActionState<T> {
  isSuccess: boolean;
  message: string;
  data?: T;
}

export interface MLJob {
  // TODO: Define ML job interface
}
