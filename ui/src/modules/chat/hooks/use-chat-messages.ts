import { useInfiniteQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { ChatMessage, PaginatedResponse } from "../types";

const DEFAULT_LIMIT = 50;

async function fetchChatMessages(
  chatId: string,
  page: number,
  limit: number,
): Promise<PaginatedResponse<ChatMessage>> {
  return apiClient<PaginatedResponse<ChatMessage>>(
    `/api/chats/${chatId}/messages?page=${page}&limit=${limit}`,
  );
}

export function useChatMessages(
  chatId: string,
  options?: { isProcessing?: boolean; limit?: number },
) {
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const isProcessing = options?.isProcessing ?? false;

  return useInfiniteQuery({
    queryKey: ["chats", chatId, "messages", { limit }],
    queryFn: ({ pageParam }) => fetchChatMessages(chatId, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    refetchInterval: isProcessing ? 3000 : false,
  });
}
