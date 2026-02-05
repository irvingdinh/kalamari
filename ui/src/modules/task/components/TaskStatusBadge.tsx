import { Badge } from "@/components/ui/badge.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";

import { TaskStatus } from "../types";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export const TaskStatusBadge = ({ status }: TaskStatusBadgeProps) => {
  switch (status) {
    case TaskStatus.IN_PROGRESS:
      return (
        <Badge className="bg-blue-50 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <Spinner data-icon="inline-start" />
          In Progress
        </Badge>
      );
    case TaskStatus.WAIT_FOR_REVIEW:
      return (
        <Badge className="bg-orange-50 text-xs text-orange-700 dark:bg-orange-950 dark:text-orange-300">
          Need Review
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-50 text-xs text-gray-700 dark:bg-gray-950 dark:text-gray-300">
          {status === TaskStatus.BACKLOG ? "Backlog" : "Completed"}
        </Badge>
      );
  }
};
