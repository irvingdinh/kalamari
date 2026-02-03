import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { Workspace } from "../types";

interface CreateWorkspaceInput {
  name: string;
  description?: string;
  workingDirectory?: string;
}

async function createWorkspace(
  input: CreateWorkspaceInput,
): Promise<Workspace> {
  return apiClient<Workspace>("/api/workspaces", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
