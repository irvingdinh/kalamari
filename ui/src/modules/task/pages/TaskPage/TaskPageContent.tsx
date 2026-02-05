import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import type { Agent } from "@/modules/agent/types";
import { CodeBlock } from "@/modules/core/components/CodeBlock";
import type { Workspace } from "@/modules/workspace/types";

import { AddCommentForm } from "../../components/AddCommentForm";
import { TaskCommentsList } from "../../components/TaskCommentsList";
import { TaskStatusBadge } from "../../components/TaskStatusBadge";
import { useTaskComments } from "../../hooks/use-task-comments";
import type { Task } from "../../types";

interface TaskPageContentProps {
  task: Task;
  workspace: Workspace;
  agents: Agent[];
}

export const TaskPageContent = ({
  task,
  workspace,
  agents,
}: TaskPageContentProps) => {
  const commentsQuery = useTaskComments(task.id);

  return (
    <div>
      <div className="flex w-full items-center justify-start border-b p-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{task.summary}</h2>
          </div>
          <div className="max-w-lg">
            <TaskStatusBadge status={task.status} />
          </div>
        </div>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/workspaces/${workspace.id}/tasks/${task.id}/edit`}>
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <div>
            <Field>
              <FieldLabel>Description</FieldLabel>
              {task.description && (
                <CodeBlock code={task.description} lang="markdown" />
              )}
            </Field>
          </div>

          <div>
            <Field>
              <FieldLabel>Comments</FieldLabel>
              <AddCommentForm taskId={task.id} />
              <ScrollArea className="max-h-64">
                <TaskCommentsList
                  comments={commentsQuery.data?.data ?? []}
                  agents={agents}
                  isLoading={commentsQuery.isLoading}
                />
              </ScrollArea>
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
};
