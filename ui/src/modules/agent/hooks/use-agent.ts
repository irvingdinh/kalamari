import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { Agent } from "../types";

async function fetchAgent(agentId: string): Promise<Agent> {
  return apiClient<Agent>(`/api/agents/${agentId}`);
}

export function useAgent(agentId: string) {
  return useQuery({
    queryKey: ["agents", agentId],
    queryFn: () => fetchAgent(agentId),
  });
}
