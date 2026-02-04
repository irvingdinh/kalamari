import { InfoIcon, LoaderIcon, SendIcon, TrashIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Markdown } from "@/components/ui/markdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspaceAgents } from "@/modules/agent/hooks/use-workspace-agents";
import { AppLayout } from "@/modules/core/components/AppLayout";
import { PageBreadcrumb } from "@/modules/core/components/PageBreadcrumb";

import { useCreateTaskComment } from "../../hooks/use-create-task-comment";
import { useDeleteTask } from "../../hooks/use-delete-task";
import { useTask } from "../../hooks/use-task";
import { useTaskComments } from "../../hooks/use-task-comments";
import { useUpdateTask } from "../../hooks/use-update-task";
import type { Task, TaskComment, TaskStatus } from "../../types";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In Progress" },
  { value: "wait_for_review", label: "Waiting for Review" },
  { value: "completed", label: "Completed" },
];

const ACTOR_LABELS: Record<string, string> = {
  user: "You",
  agent: "Agent",
  system: "System",
};

interface CommentFormValues {
  text: string;
}

interface TaskFormValues {
  summary: string;
  description: string;
  status: TaskStatus;
}

const TaskDetails = ({
  task,
  workspaceId,
}: {
  task: Task;
  workspaceId: string;
}) => {
  const navigate = useNavigate();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isProcessing =
    task.status === "backlog" || task.status === "in_progress";

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TaskFormValues>({
    defaultValues: {
      summary: task.summary,
      description: task.description ?? "",
      status: task.status,
    },
  });

  // Sync form with polling data when user hasn't made local edits
  useEffect(() => {
    if (!isDirty) {
      reset({
        summary: task.summary,
        description: task.description ?? "",
        status: task.status,
      });
    }
  }, [task.summary, task.description, task.status, isDirty, reset]);

  const onSubmit = (data: TaskFormValues) => {
    updateTask.mutate(
      {
        taskId: task.id,
        summary: data.summary,
        description: data.description || undefined,
        status: data.status,
      },
      {
        onSuccess: () => {
          reset(data);
        },
      },
    );
  };

  const handleDelete = () => {
    deleteTask.mutate(task.id, {
      onSuccess: () => navigate(`/workspaces/${workspaceId}/tasks`),
      onSettled: () => setShowDeleteDialog(false),
    });
  };

  return (
    <>
      {updateTask.isError && (
        <div className="text-destructive text-sm">
          Failed to update task: {updateTask.error.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="summary">Summary</Label>
          <Input
            id="summary"
            placeholder="Task summary"
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
            <p className="text-destructive text-sm">{errors.summary.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Optional description"
            rows={4}
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-destructive text-sm">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
          {isProcessing && (
            <span className="flex items-center gap-1">
              <LoaderIcon className="size-3 animate-spin" />
              Processing
            </span>
          )}
          <span>Created {new Date(task.createdAt).toLocaleString()}</span>
          <span>
            Last activity {new Date(task.lastActivityAt).toLocaleString()}
          </span>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting || updateTask.isPending}>
            {updateTask.isPending ? "Saving..." : "Save"}
          </Button>

          <div className="ml-auto">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowDeleteDialog(true)}
            >
              <TrashIcon className="size-4" />
            </Button>
          </div>
        </div>
      </form>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteTask.isPending}
            >
              {deleteTask.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const CommentItem = ({
  comment,
  resolveAgentName,
}: {
  comment: TaskComment;
  resolveAgentName: (actorId: string | null) => string | undefined;
}) => {
  const isUser = comment.actorType === "user";
  const isSystem = comment.actorType === "system";
  const isAgent = comment.actorType === "agent";

  if (isSystem) {
    return (
      <div className="bg-muted flex flex-col gap-1 rounded-md px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium italic">
            System
          </span>
          <span className="text-muted-foreground text-xs">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>
        <p className="text-muted-foreground text-sm whitespace-pre-wrap italic">
          {comment.text}
        </p>
      </div>
    );
  }

  const actorLabel = isAgent
    ? (resolveAgentName(comment.actorId) ?? "Agent")
    : (ACTOR_LABELS[comment.actorType] ?? comment.actorType);

  return (
    <div
      className={`flex flex-col gap-1 rounded-lg border-l-2 px-3 py-2 ${
        isUser ? "border-l-primary" : "border-l-muted-foreground"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium">{actorLabel}</span>
        <span className="text-muted-foreground text-xs">
          {new Date(comment.createdAt).toLocaleString()}
        </span>
      </div>
      {isAgent ? (
        <Markdown className="text-sm">{comment.text}</Markdown>
      ) : (
        <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
      )}
    </div>
  );
};

const CommentsSection = ({
  taskId,
  workspaceId,
  taskStatus,
}: {
  taskId: string;
  workspaceId: string;
  taskStatus: TaskStatus;
}) => {
  const isProcessing =
    taskStatus === "backlog" || taskStatus === "in_progress";

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTaskComments(taskId, { isProcessing });
  const { data: agents } = useWorkspaceAgents(workspaceId);
  const createComment = useCreateTaskComment();
  const latestCommentRef = useRef<HTMLDivElement>(null);
  const prevCommentCountRef = useRef(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormValues>({
    defaultValues: { text: "" },
  });

  // API returns comments DESC (newest first), reverse for chronological display
  const comments = useMemo(
    () => [...(data?.pages.flatMap((page) => page.data) ?? [])].reverse(),
    [data],
  );

  // Auto-scroll to latest comment when new ones arrive
  useEffect(() => {
    if (comments.length > prevCommentCountRef.current) {
      latestCommentRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevCommentCountRef.current = comments.length;
  }, [comments.length]);

  const agentMap = useMemo(() => {
    const map = new Map<string, string>();
    agents?.forEach((agent) => map.set(agent.id, agent.name));
    return map;
  }, [agents]);

  const resolveAgentName = useCallback(
    (actorId: string | null) => {
      if (!actorId) return undefined;
      return agentMap.get(actorId);
    },
    [agentMap],
  );

  const onSubmit = (formData: CommentFormValues) => {
    createComment.mutate(
      { taskId, text: formData.text },
      { onSuccess: () => reset() },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium">Comments</h3>

      {isLoading && (
        <div className="flex justify-center py-4">
          <LoaderIcon className="size-5 animate-spin" />
        </div>
      )}

      {isError && (
        <div className="text-destructive py-4 text-center text-sm">
          Failed to load comments: {error.message}
        </div>
      )}

      {!isLoading && !isError && comments.length === 0 && (
        <div className="text-muted-foreground py-4 text-center text-sm">
          No comments yet.
        </div>
      )}

      {comments.length > 0 && (
        <div className="flex flex-col gap-4">
          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading..." : "Load older comments"}
              </Button>
            </div>
          )}

          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              resolveAgentName={resolveAgentName}
            />
          ))}
          <div ref={latestCommentRef} />
        </div>
      )}

      {taskStatus === "wait_for_review" && (
        <div className="bg-muted text-muted-foreground flex items-start gap-2 rounded-md px-3 py-2 text-xs">
          <InfoIcon className="mt-0.5 size-3 shrink-0" />
          <span>
            This task is waiting for review. Adding a comment will resume
            processing automatically.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <Textarea
          placeholder="Add a comment..."
          rows={3}
          aria-invalid={!!errors.text}
          {...register("text", { required: "Comment text is required" })}
        />
        {errors.text && (
          <p className="text-destructive text-sm">{errors.text.message}</p>
        )}
        {createComment.isError && (
          <p className="text-destructive text-sm">
            {createComment.error.message}
          </p>
        )}
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={createComment.isPending}>
            <SendIcon className="size-4" />
            {createComment.isPending ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const ViewTaskPage = () => {
  const { workspaceId, taskId } = useParams<{
    workspaceId: string;
    taskId: string;
  }>();
  const { data: task, isLoading, isError, error } = useTask(taskId!);

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
          Failed to load task: {error.message}
        </div>
      </AppLayout>
    );
  }

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
            { label: task!.summary },
          ]}
        />

        <TaskDetails task={task!} workspaceId={workspaceId!} />

        <Separator />

        <CommentsSection
          taskId={taskId!}
          workspaceId={workspaceId!}
          taskStatus={task!.status}
        />
      </div>
    </AppLayout>
  );
};
