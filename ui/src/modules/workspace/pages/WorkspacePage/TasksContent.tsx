import { PlusCircleIcon } from "lucide-react";
import { Link } from "react-router";

import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item.tsx";
import { formatRelativeTime } from "@/lib/format-relative-time.ts";
import { TaskStatusBadge } from "@/modules/task/components/TaskStatusBadge.tsx";
import { type Task, TaskStatus } from "@/modules/task/types.ts";

interface TasksContentProps {
  tasks: Task[];
}

interface TaskSectionProps {
  tasks: Task[];
}

const TaskSection = ({ tasks }: TaskSectionProps) => {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <Item key={task.id} variant="outline" size="sm" asChild>
          <Link to="#">
            <ItemContent>
              <ItemTitle>{task.summary}</ItemTitle>
              <ItemDescription className="line-clamp-1">
                <div className="flex flex-row gap-1">
                  <TaskStatusBadge status={task.status} />
                  {formatRelativeTime(task.lastActivityAt)}
                </div>
              </ItemDescription>
            </ItemContent>
          </Link>
        </Item>
      ))}
    </div>
  );
};

export const TasksContent = ({ tasks }: TasksContentProps) => {
  const inProgressTasks = tasks.filter(
    (t) => t.status === TaskStatus.IN_PROGRESS,
  );
  const waitForReviewTasks = tasks.filter(
    (t) => t.status === TaskStatus.WAIT_FOR_REVIEW,
  );
  const otherTasks = tasks.filter(
    (t) => t.status === TaskStatus.BACKLOG || t.status === TaskStatus.COMPLETED,
  );

  const hasAnyTasks = tasks.length > 0;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center">
        <h2 className="text-lg font-medium">Tasks</h2>
        <div className="ml-auto">
          <Button variant="ghost" size="sm" asChild>
            <Link to="#">
              <PlusCircleIcon />
            </Link>
          </Button>
        </div>
      </div>

      {!hasAnyTasks ? (
        <Alert>
          <AlertDescription>No tasks yet.</AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-4">
          <TaskSection tasks={inProgressTasks} />
          <TaskSection tasks={waitForReviewTasks} />
          <TaskSection tasks={otherTasks} />
        </div>
      )}
    </section>
  );
};
