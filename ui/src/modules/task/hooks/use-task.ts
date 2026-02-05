import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { Task } from "../types";

async function fetchTask(taskId: string): Promise<Task> {
  return apiClient<Task>(`/api/tasks/${taskId}`);
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ["tasks", taskId],
    queryFn: () => fetchTask(taskId),
  });
}
