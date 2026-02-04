import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppLayout } from "@/modules/core/components/AppLayout";
import { PageBreadcrumb } from "@/modules/core/components/PageBreadcrumb";

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
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      summary: "",
      description: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createTask.mutate(
      {
        workspaceId: workspaceId!,
        summary: data.summary,
        description: data.description || undefined,
      },
      {
        onSuccess: (task) =>
          navigate(`/workspaces/${workspaceId}/tasks/${task.id}`),
      },
    );
  };

  return (
    <AppLayout className="flex justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <PageBreadcrumb
          workspaceId={workspaceId!}
          segments={[
            {
              label: "Tasks",
              href: `/workspaces/${workspaceId}/tasks`,
            },
            { label: "Create" },
          ]}
        />

        <h2 className="text-lg font-medium">Create Task</h2>

        {createTask.isError && (
          <div className="text-destructive text-sm">
            Failed to create task: {createTask.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="summary">Summary</Label>
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
              <p className="text-destructive text-sm">
                {errors.summary.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description with more details"
              rows={5}
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-destructive text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || createTask.isPending}
            >
              {createTask.isPending ? "Creating..." : "Create"}
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/workspaces/${workspaceId}/tasks`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
