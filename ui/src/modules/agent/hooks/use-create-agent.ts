import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { Agent } from "../types";

interface CreateAgentInput {
  workspaceId: string;
  name: string;
  description?: string;
  instruction?: string;
  cliType: string;
}

async function createAgent(input: CreateAgentInput): Promise<Agent> {
  const { workspaceId, ...body } = input;
  return apiClient<Agent>(`/api/workspaces/${workspaceId}/agents`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
