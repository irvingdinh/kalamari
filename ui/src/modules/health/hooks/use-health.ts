import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { HealthResponse } from "../types";

const HEALTH_QUERY_KEY = ["health"] as const;

async function fetchHealth(): Promise<HealthResponse> {
  return apiClient<HealthResponse>("/api/health");
}

export function useHealth() {
  return useQuery({
    queryKey: HEALTH_QUERY_KEY,
    queryFn: fetchHealth,
  });
}
