import { AlertCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

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
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      workingDirectory: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    await createWorkspace.mutateAsync({
      name: data.name,
      description: data.description || undefined,
      workingDirectory: data.workingDirectory || undefined,
    });

    navigate("/workspaces");
  };

  return (
    <AppLayout
      breadcrumbItems={[
        { label: "Workspaces", href: "/workspaces" },
        { label: "Create Workspace" },
      ]}
      title="Create Workspace"
      className="flex justify-center p-4"
    >
      <div className="flex w-full max-w-xl flex-col gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet disabled={createWorkspace.isPending}>
            <FieldGroup>
              {createWorkspace.isError && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Create Workspace Failed</AlertTitle>
                  <AlertDescription>
                    {createWorkspace.error.message}
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
                      message:
                        "Working directory must be at most 255 characters",
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
                    onClick={() => navigate("/workspaces")}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" className="w-full sm:w-auto">
                    {createWorkspace.isPending
                      ? "Creating..."
                      : "Create Workspace"}
                  </Button>
                </div>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </div>
    </AppLayout>
  );
};
