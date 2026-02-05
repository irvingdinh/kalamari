import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/types";

import type { Task } from "../types";

const WORKSPACE_TASKS_QUERY_KEY = ["workspace-tasks"] as const;

async function fetchWorkspaceTasks(workspaceId: string): Promise<Task[]> {
  const response = await apiClient<PaginatedResponse<Task>>(
    `/api/tasks?workspace_id=${workspaceId}`,
  );
  return response.data;
}

export function useWorkspaceTasks(workspaceId: string) {
  return useQuery({
    queryKey: [...WORKSPACE_TASKS_QUERY_KEY, { workspaceId }],
    queryFn: () => fetchWorkspaceTasks(workspaceId),
  });
}
