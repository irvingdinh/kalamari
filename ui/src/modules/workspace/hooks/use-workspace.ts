import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { Workspace } from "../types";

async function fetchWorkspace(workspaceId: string): Promise<Workspace> {
  return apiClient<Workspace>(`/api/workspaces/${workspaceId}`);
}

export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: ["workspaces", workspaceId],
    queryFn: () => fetchWorkspace(workspaceId),
  });
}
