import { useInfiniteQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/types";

import type { Workspace } from "../types";

const WORKSPACES_QUERY_KEY = ["workspaces"] as const;
const DEFAULT_LIMIT = 10;

async function fetchWorkspaces(
  page: number,
  limit: number = DEFAULT_LIMIT,
): Promise<PaginatedResponse<Workspace>> {
  return apiClient<PaginatedResponse<Workspace>>(
    `/api/workspaces?page=${page}&limit=${limit}`,
  );
}

export function useWorkspaces(limit: number = DEFAULT_LIMIT) {
  return useInfiniteQuery({
    queryKey: [...WORKSPACES_QUERY_KEY, { limit }],
    queryFn: ({ pageParam }) => fetchWorkspaces(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });
}
