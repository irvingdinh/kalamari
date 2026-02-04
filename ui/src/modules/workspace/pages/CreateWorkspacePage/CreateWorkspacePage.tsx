import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppLayout } from "@/modules/core/components/AppLayout";

import { useCreateWorkspace } from "../../hooks/use-create-workspace";

interface FormValues {
  name: string;
  description: string;
  workingDirectory: string;
}

export const CreateWorkspacePage = () => {
  const navigate = useNavigate();
  const createWorkspace = useCreateWorkspace();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      workingDirectory: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createWorkspace.mutate(
      {
        name: data.name,
        description: data.description || undefined,
        workingDirectory: data.workingDirectory || undefined,
      },
      {
        onSuccess: (workspace) =>
          navigate(`/workspaces/${workspace.id}`),
      },
    );
  };

  return (
    <AppLayout className="flex justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <h2 className="text-lg font-medium">Create Workspace</h2>

        {createWorkspace.isError && (
          <div className="text-destructive text-sm">
            Failed to create workspace: {createWorkspace.error.message}
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
              disabled={isSubmitting || createWorkspace.isPending}
            >
              {createWorkspace.isPending ? "Creating..." : "Create"}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/workspaces">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
