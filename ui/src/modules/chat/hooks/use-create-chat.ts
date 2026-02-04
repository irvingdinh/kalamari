import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { Chat, CliType } from "../types";

interface CreateChatInput {
  workspaceId: string;
  name?: string;
  agentId?: string;
  cliType?: CliType;
}

async function createChat(input: CreateChatInput): Promise<Chat> {
  const { workspaceId, ...body } = input;
  return apiClient<Chat>(`/api/workspaces/${workspaceId}/chats`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}
