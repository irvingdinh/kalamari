import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { Chat } from "../types";

async function fetchChat(chatId: string): Promise<Chat> {
  return apiClient<Chat>(`/api/chats/${chatId}`);
}

export function useChat(chatId: string) {
  return useQuery({
    queryKey: ["chats", chatId],
    queryFn: () => fetchChat(chatId),
    refetchInterval: (query) => {
      const chat = query.state.data;
      return chat?.isProcessing ? 3000 : false;
    },
  });
}
