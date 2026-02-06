import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/types";

import type { Chat } from "../types";

const CHATS_QUERY_KEY = ["chats"] as const;

async function fetchChats(): Promise<Chat[]> {
  const response = await apiClient<PaginatedResponse<Chat>>(
    `/api/chats?include=workspace`,
  );
  return response.data;
}

export function useChats() {
  return useQuery({
    queryKey: [...CHATS_QUERY_KEY],
    queryFn: () => fetchChats(),
  });
}
