import { AlertCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AppLayout } from "@/modules/core/components/AppLayout";
import { ErrorIndicator } from "@/modules/core/components/ErrorIndicator";
import { LoadingIndicator } from "@/modules/core/components/LoadingIndicator";

import { useUpdateWorkspace } from "../../hooks/use-update-workspace";
import { useWorkspace } from "../../hooks/use-workspace";
import type { Workspace } from "../../types";

interface FormValues {
  name: string;
  description: string;
  workingDirectory: string;
}

const EditWorkspaceForm = ({ workspace }: { workspace: Workspace }) => {
  const navigate = useNavigate();
  const updateWorkspace = useUpdateWorkspace();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: workspace.name,
      description: workspace.description ?? "",
      workingDirectory: workspace.workingDirectory ?? "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    await updateWorkspace.mutateAsync({
      workspaceId: workspace.id,
      name: data.name,
      description: data.description || undefined,
      workingDirectory: data.workingDirectory || undefined,
    });

    navigate(`/workspaces/${workspace.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldSet disabled={updateWorkspace.isPending}>
        <FieldGroup>
          {updateWorkspace.isError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Update Workspace Failed</AlertTitle>
              <AlertDescription>
                {updateWorkspace.error.message}
              </AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              placeholder="Example Workspace"
              aria-invalid={!!errors.name}
              {...register("name", {
                required: "Name is required",
                maxLength: {
                  value: 255,
                  message: "Name must be at most 255 characters",
                },
              })}
            />
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              placeholder="Lorem ipsum dolor sit amet"
              aria-invalid={!!errors.description}
              className="h-24 overflow-y-auto"
              {...register("description", {
                maxLength: {
                  value: 1000,
                  message: "Description must be at most 1000 characters",
                },
              })}
            />
            {errors.description && (
              <FieldError>{errors.description.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="workingDirectory">
              Working Directory
            </FieldLabel>
            <Input
              id="workingDirectory"
              placeholder="/Users/irvingdinh"
              aria-invalid={!!errors.workingDirectory}
              {...register("workingDirectory", {
                maxLength: {
                  value: 255,
                  message: "Working directory must be at most 255 characters",
                },
              })}
            />
            <FieldDescription>
              The directory where AI agents will run. Leave blank to use a
              temporary folder for each task or chat session.
            </FieldDescription>
            {errors.workingDirectory && (
              <FieldError>{errors.workingDirectory.message}</FieldError>
            )}
          </Field>

          <Field>
            <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground w-full sm:w-auto"
                onClick={() => navigate(`/workspaces/${workspace.id}`)}
              >
                Cancel
              </Button>

              <Button type="submit" className="w-full sm:w-auto">
                {updateWorkspace.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
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
    return <LoadingIndicator pageTitle="Edit Workspace" />;
  }

  if (isError) {
    return (
      <ErrorIndicator
        pageTitle="Edit Workspace"
        title="Failed to Load Workspace"
        message={error.message}
      />
    );
  }

  return (
    <AppLayout
      breadcrumbItems={[
        { label: "Workspaces", href: "/workspaces" },
        { label: workspace!.name, href: `/workspaces/${workspaceId}` },
        { label: "Edit" },
      ]}
      title={`${workspace!.name} | Edit Workspace`}
      className="flex justify-center p-4"
    >
      <div className="flex w-full max-w-xl flex-col gap-6">
        <EditWorkspaceForm workspace={workspace!} />
      </div>
    </AppLayout>
  );
};
