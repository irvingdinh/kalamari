import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { Agent } from "../types";

interface ReorderAgentsInput {
  workspaceId: string;
  agentIds: string[];
}

async function reorderAgents(input: ReorderAgentsInput): Promise<Agent[]> {
  return apiClient<Agent[]>(
    `/api/workspaces/${input.workspaceId}/agents/reorder`,
    {
      method: "PUT",
      body: JSON.stringify({ agentIds: input.agentIds }),
    },
  );
}

export function useReorderAgents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderAgents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
