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
import type { Task } from "@/modules/task/types.ts";

interface TasksContentProps {
  workspaceId: string;
  tasks: Task[];
}

export const TasksContent = ({ workspaceId, tasks }: TasksContentProps) => {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center">
        <h2 className="text-lg font-medium">Tasks</h2>
        <div className="ml-auto">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/workspaces/${workspaceId}/tasks/create`}>
              <PlusCircleIcon />
            </Link>
          </Button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <Alert>
          <AlertDescription>No tasks yet.</AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <Item key={task.id} variant="outline" size="sm" asChild>
              <Link to={`/workspaces/${workspaceId}/tasks/${task.id}`}>
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
      )}
    </section>
  );
};
