import { LoaderIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppLayout } from "@/modules/core/components/AppLayout";
import { PageBreadcrumb } from "@/modules/core/components/PageBreadcrumb";

import { useDeleteWorkspace } from "../../hooks/use-delete-workspace";
import { useUpdateWorkspace } from "../../hooks/use-update-workspace";
import { useWorkspace } from "../../hooks/use-workspace";
import type { Workspace } from "../../types";

interface FormValues {
  name: string;
  description: string;
  workingDirectory: string;
}

const EditWorkspaceForm = ({
  workspace,
  workspaceId,
}: {
  workspace: Workspace;
  workspaceId: string;
}) => {
  const navigate = useNavigate();
  const updateWorkspace = useUpdateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: workspace.name,
      description: workspace.description ?? "",
      workingDirectory: workspace.workingDirectory ?? "",
    },
  });

  const onSubmit = (data: FormValues) => {
    updateWorkspace.mutate(
      {
        workspaceId: workspace.id,
        name: data.name,
        description: data.description,
        workingDirectory: data.workingDirectory,
      },
      {
        onSuccess: () => navigate(`/workspaces/${workspace.id}`),
      },
    );
  };

  const onDelete = () => {
    deleteWorkspace.mutate(workspace.id, {
      onSuccess: () => navigate("/workspaces"),
    });
  };

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <PageBreadcrumb
        workspaceId={workspaceId}
        segments={[{ label: "Settings" }]}
      />

      <h2 className="text-lg font-medium">Edit Workspace</h2>

      {updateWorkspace.isError && (
        <div className="text-destructive text-sm">
          Failed to update workspace: {updateWorkspace.error.message}
        </div>
      )}

      {deleteWorkspace.isError && (
        <div className="text-destructive text-sm">
          Failed to delete workspace: {deleteWorkspace.error.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="My Workspace"
            aria-invalid={!!errors.name}
            {...register("name", {
              required: "Name is required",
              maxLength: {
                value: 255,
                message: "Name must be at most 255 characters",
              },
            })}
          />
          {errors.name && (
            <p className="text-destructive text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Optional description"
            rows={3}
            aria-invalid={!!errors.description}
            {...register("description", {
              maxLength: {
                value: 1000,
                message: "Description must be at most 1000 characters",
              },
            })}
          />
          {errors.description && (
            <p className="text-destructive text-sm">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="workingDirectory">Working Directory</Label>
          <Input
            id="workingDirectory"
            placeholder="/path/to/project"
            aria-invalid={!!errors.workingDirectory}
            {...register("workingDirectory", {
              maxLength: {
                value: 255,
                message: "Working directory must be at most 255 characters",
              },
            })}
          />
          {errors.workingDirectory && (
            <p className="text-destructive text-sm">
              {errors.workingDirectory.message}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isSubmitting || updateWorkspace.isPending}
          >
            {updateWorkspace.isPending ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/workspaces/${workspaceId}`}>Cancel</Link>
          </Button>

          <div className="ml-auto">
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleteWorkspace.isPending}
                >
                  {deleteWorkspace.isPending ? "Deleting..." : "Delete"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the workspace and all its
                    associated chats, tasks, and agents. This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={onDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </form>
    </div>
  );
};

export const EditWorkspacePage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const {
    data: workspace,
    isLoading,
    isError,
    error,
  } = useWorkspace(workspaceId!);

  if (isLoading) {
    return (
      <AppLayout className="flex justify-center p-4">
        <div className="flex w-full max-w-3xl justify-center py-8">
          <LoaderIcon className="size-5 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout className="flex justify-center p-4">
        <div className="text-destructive flex w-full max-w-3xl justify-center py-8 text-sm">
          Failed to load workspace: {error.message}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout className="flex justify-center p-4">
      <EditWorkspaceForm workspace={workspace!} workspaceId={workspaceId!} />
    </AppLayout>
  );
};
