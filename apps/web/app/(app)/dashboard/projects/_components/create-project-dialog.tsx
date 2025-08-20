/**
 * @description
 * This client component manages the state and rendering of the dialog (modal)
 * for creating a new project. It acts as a wrapper that combines the dialog trigger
 * button with the actual dialog content and form.
 *
 * Key features:
 * - State Management: Uses `useState` to control the open/closed state of the dialog.
 * - Composition: Renders the `Dialog` primitives from shadcn/ui and embeds the `CreateProjectForm`.
 * - User Experience: The dialog automatically closes upon successful form submission, providing
 *   clear feedback to the user.
 *
 * @dependencies
 * - `react`: For `useState`.
 * - `@radix-ui/react-icons`: For the `PlusIcon`.
 * - `@/components/ui/button`: The trigger button for the dialog.
 * - `@/components/ui/dialog`: The dialog components from shadcn/ui.
 * - ./create-project-form: The form component used to create a new project.
 *
 * @notes
 * - The `onOpenChange={setOpen}` prop on `<Dialog>` ensures that the component's state
 *   is synchronized with the dialog's visibility (e.g., closing via the 'esc' key or overlay click).
 */
"use client";

import * as React from "react";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateProjectForm } from "./create-project-form";

/**
 * Renders a button that opens a dialog containing the form to create a new project.
 *
 * @returns {JSX.Element} The rendered component.
 */
export function CreateProjectDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Give your project a name to get started. You can change this later.
          </DialogDescription>
        </DialogHeader>
        <CreateProjectForm onFormSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
