import { useInfiniteQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { Chat, PaginatedResponse } from "../types";

const CHATS_QUERY_KEY = ["chats"] as const;
const DEFAULT_LIMIT = 10;

interface UseChatsOptions {
  workspaceId: string;
  limit?: number;
}

async function fetchChats(
  workspaceId: string,
  page: number,
  limit: number,
): Promise<PaginatedResponse<Chat>> {
  const params = new URLSearchParams({
    workspace_id: workspaceId,
    page: String(page),
    limit: String(limit),
  });
  return apiClient<PaginatedResponse<Chat>>(`/api/chats?${params}`);
}

export function useChats({
  workspaceId,
  limit = DEFAULT_LIMIT,
}: UseChatsOptions) {
  return useInfiniteQuery({
    queryKey: [...CHATS_QUERY_KEY, { workspaceId, limit }],
    queryFn: ({ pageParam }) => fetchChats(workspaceId, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.pages.some((page) =>
        page.data.some((chat) => chat.isProcessing),
      );
      return hasProcessing ? 3000 : false;
    },
  });
}
