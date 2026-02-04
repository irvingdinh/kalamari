import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { Chat } from "../types";

async function cancelChat(chatId: string): Promise<Chat> {
  return apiClient<Chat>(`/api/chats/${chatId}/cancel`, {
    method: "POST",
  });
}

export function useCancelChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelChat,
    onSuccess: (_data, chatId) => {
      queryClient.invalidateQueries({ queryKey: ["chats", chatId] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}
