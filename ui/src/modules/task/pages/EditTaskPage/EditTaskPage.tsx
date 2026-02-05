import { AlertCircleIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AppLayout } from "@/modules/core/components/AppLayout";
import { ErrorIndicator } from "@/modules/core/components/ErrorIndicator";
import { LoadingIndicator } from "@/modules/core/components/LoadingIndicator";
import { useWorkspace } from "@/modules/workspace/hooks/use-workspace";

import { useTask } from "../../hooks/use-task";
import { useUpdateTask } from "../../hooks/use-update-task";
import type { Task, TaskStatus } from "../../types";
import { TaskStatusOptions } from "../../types";

interface FormValues {
  summary: string;
  description: string;
  status: TaskStatus;
}

const EditTaskForm = ({ task }: { task: Task }) => {
  const navigate = useNavigate();
  const updateTask = useUpdateTask();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      summary: task.summary,
      description: task.description ?? "",
      status: task.status,
    },
  });

  const onSubmit = async (data: FormValues) => {
    await updateTask.mutateAsync({
      taskId: task.id,
      summary: data.summary,
      description: data.description || undefined,
      status: data.status,
    });

    navigate(`/workspaces/${task.workspaceId}/tasks/${task.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldSet disabled={updateTask.isPending}>
        <FieldGroup>
          {updateTask.isError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Update Task Failed</AlertTitle>
              <AlertDescription>{updateTask.error.message}</AlertDescription>
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
              {...register("description")}
            />
            {errors.description && (
              <FieldError>{errors.description.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {TaskStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && <FieldError>{errors.status.message}</FieldError>}
          </Field>

          <Field>
            <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground w-full sm:w-auto"
                onClick={() =>
                  navigate(`/workspaces/${task.workspaceId}/tasks/${task.id}`)
                }
              >
                Cancel
              </Button>

              <Button type="submit" className="w-full sm:w-auto">
                {updateTask.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
};

export const EditTaskPage = () => {
  const { workspaceId, taskId } = useParams<{
    workspaceId: string;
    taskId: string;
  }>();

  const taskQuery = useTask(taskId!);
  const workspaceQuery = useWorkspace(workspaceId!);

  const queries = [taskQuery, workspaceQuery];
  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const error = queries.find((q) => q.error)?.error;

  if (isLoading) {
    return <LoadingIndicator pageTitle="Edit Task" />;
  }

  if (isError) {
    return (
      <ErrorIndicator
        pageTitle="Edit Task"
        title="Failed to Load Task"
        message={error?.message}
      />
    );
  }

  const task = taskQuery.data!;
  const workspace = workspaceQuery.data!;

  return (
    <AppLayout
      breadcrumbItems={[
        { label: "Workspaces", href: "/workspaces" },
        { label: workspace.name, href: `/workspaces/${workspace.id}` },
        {
          label: task.summary,
          href: `/workspaces/${workspace.id}/tasks/${task.id}`,
        },
        { label: "Edit" },
      ]}
      title={`${task.summary} | Edit Task`}
      className="flex justify-center p-4"
    >
      <div className="flex w-full max-w-xl flex-col gap-6">
        <EditTaskForm task={task} />
      </div>
    </AppLayout>
  );
};
