import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/types";

import type { Chat } from "../types";

const WORKSPACE_CHATS_QUERY_KEY = ["workspace-chats"] as const;

async function fetchWorkspaceChats(workspaceId: string): Promise<Chat[]> {
  const response = await apiClient<PaginatedResponse<Chat>>(
    `/api/chats?workspace_id=${workspaceId}&limit=5`,
  );
  return response.data;
}

export function useWorkspaceChats(workspaceId: string) {
  return useQuery({
    queryKey: [...WORKSPACE_CHATS_QUERY_KEY, { workspaceId }],
    queryFn: () => fetchWorkspaceChats(workspaceId),
  });
}
