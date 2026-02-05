import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { Task } from "../types";

interface CreateTaskInput {
  workspaceId: string;
  summary: string;
  description: string;
}

async function createTask(input: CreateTaskInput): Promise<Task> {
  const { workspaceId, ...body } = input;
  return apiClient<Task>(`/api/workspaces/${workspaceId}/tasks`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
