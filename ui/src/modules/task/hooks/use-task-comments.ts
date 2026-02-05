import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/types";

import type { TaskComment } from "../types";

export const TASK_COMMENTS_QUERY_KEY = ["task-comments"] as const;

async function fetchTaskComments(
  taskId: string,
): Promise<PaginatedResponse<TaskComment>> {
  return apiClient<PaginatedResponse<TaskComment>>(
    `/api/tasks/${taskId}/comments`,
  );
}

export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: [...TASK_COMMENTS_QUERY_KEY, taskId],
    queryFn: () => fetchTaskComments(taskId),
  });
}
