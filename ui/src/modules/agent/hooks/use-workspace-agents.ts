import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { Agent } from "../types";

const AGENTS_QUERY_KEY = ["agents"] as const;

async function fetchWorkspaceAgents(workspaceId: string): Promise<Agent[]> {
  return apiClient<Agent[]>(`/api/agents?workspace_id=${workspaceId}`);
}

export function useWorkspaceAgents(workspaceId: string) {
  return useQuery({
    queryKey: [...AGENTS_QUERY_KEY, { workspaceId }],
    queryFn: () => fetchWorkspaceAgents(workspaceId),
  });
}
