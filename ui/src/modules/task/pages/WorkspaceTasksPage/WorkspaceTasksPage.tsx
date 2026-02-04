import {
  ChevronRightIcon,
  EllipsisVerticalIcon,
  LoaderIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";

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
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { AppLayout } from "@/modules/core/components/AppLayout";
import { PageBreadcrumb } from "@/modules/core/components/PageBreadcrumb";

import { useDeleteTask } from "../../hooks/use-delete-task";
import { useTasks } from "../../hooks/use-tasks";
import type { Task, TaskStatus } from "../../types";

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  wait_for_review: "Waiting for Review",
  completed: "Completed",
};

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In Progress" },
  { value: "wait_for_review", label: "Waiting for Review" },
  { value: "completed", label: "Completed" },
];

export const WorkspaceTasksPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>();
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTasks({ workspaceId: workspaceId!, status: statusFilter });
  const deleteTask = useDeleteTask();

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const tasks = data?.pages.flatMap((page) => page.data) ?? [];

  const handleDelete = () => {
    if (!taskToDelete) return;
    deleteTask.mutate(taskToDelete.id, {
      onSettled: () => setTaskToDelete(null),
    });
  };

  return (
    <AppLayout className="flex justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-4">
        <PageBreadcrumb
          workspaceId={workspaceId!}
          segments={[{ label: "Tasks" }]}
        />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Tasks</h2>

          <div className="flex gap-2">
            <Select
              value={statusFilter ?? "all"}
              onValueChange={(value) =>
                setStatusFilter(
                  value === "all" ? undefined : (value as TaskStatus),
                )
              }
            >
              <SelectTrigger className="w-44" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" asChild>
              <Link to={`/workspaces/${workspaceId}/tasks/create`}>
                <PlusIcon className="size-4" />
                New
              </Link>
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <LoaderIcon className="size-5 animate-spin" />
          </div>
        )}

        {isError && (
          <div className="text-destructive py-8 text-center text-sm">
            Failed to load tasks: {error.message}
          </div>
        )}

        {!isLoading && !isError && tasks.length === 0 && (
          <div className="text-muted-foreground py-8 text-center text-sm">
            {statusFilter ? "No tasks match this filter." : "No tasks yet."}
          </div>
        )}

        {tasks.length > 0 && (
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <Item variant="outline" key={task.id}>
                <Link
                  to={`/workspaces/${workspaceId}/tasks/${task.id}`}
                  className="flex min-w-0 flex-1 items-center gap-2"
                >
                  <ItemContent>
                    <ItemTitle className="line-clamp-1">
                      {task.summary}
                    </ItemTitle>
                    <ItemDescription className="line-clamp-1">
                      {STATUS_LABELS[task.status]}
                      {task.description && ` — ${task.description}`}
                    </ItemDescription>
                    <p className="text-muted-foreground text-xs">
                      Last activity{" "}
                      {new Date(task.lastActivityAt).toLocaleString()}
                    </p>
                  </ItemContent>
                </Link>

                <ItemActions>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs">
                        <EllipsisVerticalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          to={`/workspaces/${workspaceId}/tasks/${task.id}`}
                        >
                          <ChevronRightIcon className="size-4" />
                          Open
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setTaskToDelete(task)}
                      >
                        <TrashIcon className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ItemActions>
              </Item>
            ))}
          </div>
        )}

        {hasNextPage && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </Button>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!taskToDelete}
        onOpenChange={(open) => {
          if (!open) setTaskToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{taskToDelete?.summary}"? All
              comments will be permanently deleted. This action cannot be
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
    </AppLayout>
  );
};
