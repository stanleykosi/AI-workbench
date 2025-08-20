/**
 * @description
 * This client component renders the form for creating a new project. It is designed
 * to be used within a dialog and leverages modern React hooks for an enhanced user experience
 * with Server Actions.
 *
 * Key features:
 * - `useFormState`: Manages the form's state, including validation errors and server responses,
 *   without requiring client-side state management for the form's data.
 * - `useFormStatus`: Provides the pending state of the form submission, allowing for
 *   interactive UI elements like disabling buttons and showing loading indicators.
 * - Server Action Integration: Directly calls the `createProjectAction` Server Action.
 * - Side Effects on Success: Uses `useEffect` to trigger a callback (`onFormSuccess`) when
 *   the form submission is successful, enabling parent components to react accordingly (e.g., closing a dialog).
 *
 * @dependencies
 * - `react`: For `useEffect`.
 * - `react-dom`: For `useFormState` and `useFormStatus`.
 * - `@radix-ui/react-icons`: For the loading spinner icon.
 * - `@/components/ui/*`: Imports shadcn/ui components for the form elements.
 * - `@/actions/db/projects-actions`: The server action that handles project creation.
 *
 * @notes
 * - The `initialState` for `useFormState` is set to a default structure to ensure type safety.
 * - The submit button is a separate component (`SubmitButton`) to correctly access the `useFormStatus` hook,
 *   as it must be a child of the `<form>` element.
 */
"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ReloadIcon } from "@radix-ui/react-icons";
import { createProjectAction } from "@/actions/db/projects-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * A submit button that automatically displays a loading state when the form is pending.
 * @returns {JSX.Element} The rendered button component.
 */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <ReloadIcon className="mr-2 animate-spin" />}
      Create Project
    </Button>
  );
}

interface CreateProjectFormProps {
  /**
   * A callback function to be executed when the form is successfully submitted.
   * Typically used to close the parent dialog or modal.
   */
  onFormSuccess: () => void;
}

/**
 * Renders the form for creating a new project.
 * @param {CreateProjectFormProps} props - The component props.
 * @returns {JSX.Element} The rendered form component.
 */
export function CreateProjectForm({ onFormSuccess }: CreateProjectFormProps) {
  const initialState = { isSuccess: false, message: "" };
  const [state, formAction] = useFormState(createProjectAction, initialState);

  // React hook to perform side-effects, like closing a dialog on success.
  React.useEffect(() => {
    if (state?.isSuccess) {
      onFormSuccess();
    }
  }, [state, onFormSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="projectName">Project Name</Label>
        <Input
          id="projectName"
          name="projectName"
          placeholder="My New Financial Model"
          required
        />
      </div>

      <SubmitButton />

      {/* Display error message if the action was not successful */}
      {state && !state.isSuccess && state.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
    </form>
  );
}
