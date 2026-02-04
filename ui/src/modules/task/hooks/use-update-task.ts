import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { Task, TaskStatus } from "../types";

interface UpdateTaskInput {
  taskId: string;
  summary?: string;
  description?: string;
  status?: TaskStatus;
}

async function updateTask(input: UpdateTaskInput): Promise<Task> {
  const { taskId, ...body } = input;
  return apiClient<Task>(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", variables.taskId],
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
