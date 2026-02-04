import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { TaskComment } from "../types";

interface CreateTaskCommentInput {
  taskId: string;
  text: string;
}

async function createTaskComment(
  input: CreateTaskCommentInput,
): Promise<TaskComment> {
  const { taskId, ...body } = input;
  return apiClient<TaskComment>(`/api/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function useCreateTaskComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTaskComment,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", variables.taskId, "comments"],
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
