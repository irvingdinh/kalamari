import { useInfiniteQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { PaginatedResponse, Task } from "../types";

const TASKS_QUERY_KEY = ["tasks"] as const;
const DEFAULT_LIMIT = 10;

interface UseTasksOptions {
  workspaceId: string;
  status?: string;
  limit?: number;
}

async function fetchTasks(
  workspaceId: string,
  page: number,
  limit: number,
  status?: string,
): Promise<PaginatedResponse<Task>> {
  const params = new URLSearchParams({
    workspace_id: workspaceId,
    page: String(page),
    limit: String(limit),
  });
  if (status) {
    params.set("status", status);
  }
  return apiClient<PaginatedResponse<Task>>(`/api/tasks?${params}`);
}

export function useTasks({
  workspaceId,
  status,
  limit = DEFAULT_LIMIT,
}: UseTasksOptions) {
  return useInfiniteQuery({
    queryKey: [...TASKS_QUERY_KEY, { workspaceId, status, limit }],
    queryFn: ({ pageParam }) =>
      fetchTasks(workspaceId, pageParam, limit, status),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.pages.some((page) =>
        page.data.some(
          (task) => task.status === "backlog" || task.status === "in_progress",
        ),
      );
      return hasProcessing ? 3000 : false;
    },
  });
}
