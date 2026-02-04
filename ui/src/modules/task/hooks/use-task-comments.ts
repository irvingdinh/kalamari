import { useInfiniteQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { PaginatedResponse, TaskComment } from "../types";

const DEFAULT_LIMIT = 20;

async function fetchTaskComments(
  taskId: string,
  page: number,
  limit: number,
): Promise<PaginatedResponse<TaskComment>> {
  return apiClient<PaginatedResponse<TaskComment>>(
    `/api/tasks/${taskId}/comments?page=${page}&limit=${limit}`,
  );
}

export function useTaskComments(
  taskId: string,
  options?: { isProcessing?: boolean; limit?: number },
) {
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const isProcessing = options?.isProcessing ?? false;

  return useInfiniteQuery({
    queryKey: ["tasks", taskId, "comments", { limit }],
    queryFn: ({ pageParam }) => fetchTaskComments(taskId, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    refetchInterval: isProcessing ? 3000 : false,
  });
}
