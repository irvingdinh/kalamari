import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { TaskComment } from "../types";
import { TASK_COMMENTS_QUERY_KEY } from "./use-task-comments";

interface CreateTaskCommentInput {
  taskId: string;
  text: string;
}

async function createTaskComment(
  input: CreateTaskCommentInput,
): Promise<TaskComment> {
  const { taskId, text } = input;
  return apiClient<TaskComment>(`/api/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function useCreateTaskComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTaskComment,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...TASK_COMMENTS_QUERY_KEY, variables.taskId],
      });
    },
  });
}
