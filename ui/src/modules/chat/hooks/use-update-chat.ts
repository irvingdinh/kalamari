import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { Chat, CliType } from "../types";

interface UpdateChatInput {
  chatId: string;
  name?: string;
  agentId?: string | null;
  cliType?: CliType | null;
}

async function updateChat(input: UpdateChatInput): Promise<Chat> {
  const { chatId, ...body } = input;
  return apiClient<Chat>(`/api/chats/${chatId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function useUpdateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateChat,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chats", variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}
