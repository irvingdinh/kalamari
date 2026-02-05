import { AlertCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AppLayout } from "@/modules/core/components/AppLayout";

import { useCreateTask } from "../../hooks/use-create-task";

interface FormValues {
  summary: string;
  description: string;
}

export const CreateTaskPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const createTask = useCreateTask();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      summary: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    await createTask.mutateAsync({
      workspaceId: workspaceId!,
      summary: data.summary,
      description: data.description,
    });

    navigate(`/workspaces/${workspaceId}`);
  };

  return (
    <AppLayout
      breadcrumbItems={[
        { label: "Workspaces", href: "/workspaces" },
        { label: "Create Task" },
      ]}
      title="Create Task"
      className="flex justify-center p-4"
    >
      <div className="flex w-full max-w-xl flex-col gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet disabled={createTask.isPending}>
            <FieldGroup>
              {createTask.isError && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Create Task Failed</AlertTitle>
                  <AlertDescription>
                    {createTask.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <Field>
                <FieldLabel htmlFor="summary">Summary</FieldLabel>
                <Input
                  id="summary"
                  placeholder="Implement user authentication"
                  aria-invalid={!!errors.summary}
                  {...register("summary", {
                    required: "Summary is required",
                    maxLength: {
                      value: 255,
                      message: "Summary must be at most 255 characters",
                    },
                  })}
                />
                {errors.summary && (
                  <FieldError>{errors.summary.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Add OAuth2 support with Google and GitHub providers"
                  aria-invalid={!!errors.description}
                  className="h-24 overflow-y-auto"
                  {...register("description", {
                    required: "Description is required",
                  })}
                />
                {errors.description && (
                  <FieldError>{errors.description.message}</FieldError>
                )}
              </Field>

              <Field>
                <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-muted-foreground w-full sm:w-auto"
                    onClick={() => navigate(`/workspaces/${workspaceId}`)}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" className="w-full sm:w-auto">
                    {createTask.isPending ? "Creating..." : "Create Task"}
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
