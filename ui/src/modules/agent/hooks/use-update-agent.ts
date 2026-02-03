import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { Agent } from "../types";

interface UpdateAgentInput {
  agentId: string;
  name?: string;
  description?: string;
  instruction?: string;
  cliType?: string;
}

async function updateAgent(input: UpdateAgentInput): Promise<Agent> {
  const { agentId, ...body } = input;
  return apiClient<Agent>(`/api/agents/${agentId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
