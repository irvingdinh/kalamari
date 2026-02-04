import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { ChatMessage } from "../types";

interface SendMessageInput {
  chatId: string;
  text: string;
}

async function sendMessage(input: SendMessageInput): Promise<ChatMessage> {
  const { chatId, ...body } = input;
  return apiClient<ChatMessage>(`/api/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chats", variables.chatId, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}
