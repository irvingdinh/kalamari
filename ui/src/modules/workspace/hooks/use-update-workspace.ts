import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { Workspace } from "../types";

interface UpdateWorkspaceInput {
  workspaceId: string;
  name?: string;
  description?: string;
  workingDirectory?: string;
}

async function updateWorkspace(
  input: UpdateWorkspaceInput,
): Promise<Workspace> {
  const { workspaceId, ...body } = input;
  return apiClient<Workspace>(`/api/workspaces/${workspaceId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWorkspace,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
