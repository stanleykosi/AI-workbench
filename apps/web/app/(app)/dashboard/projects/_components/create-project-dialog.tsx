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
 * - Professional UI: Enhanced styling with modern design elements and smooth animations.
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
import { PlusIcon, FileIcon } from "@radix-ui/react-icons";
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
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 group">
          <PlusIcon className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-gray-200 shadow-xl">
        <DialogHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <FileIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Create New Project</DialogTitle>
              <DialogDescription className="text-base text-gray-600 mt-1">
                Give your project a name to get started. You can change this later.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <CreateProjectForm onFormSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
