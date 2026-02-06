import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/types";

import type { Task } from "../types";

const TASKS_QUERY_KEY = ["tasks"] as const;

async function fetchTasks(): Promise<Task[]> {
  const response = await apiClient<PaginatedResponse<Task>>(
    `/api/tasks?include=workspace`,
  );
  return response.data;
}

export function useTasks() {
  return useQuery({
    queryKey: [...TASKS_QUERY_KEY],
    queryFn: () => fetchTasks(),
  });
}
