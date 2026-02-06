export interface ChatWorkspace {
  id: string;
  name: string;
}

export interface Chat {
  id: string;
  workspaceId: string;
  agentId: string | null;
  name: string;
  cliType: string | null;
  createdAt: string;
  updatedAt: string;
  isProcessing: boolean;
  workspace?: ChatWorkspace;
}
