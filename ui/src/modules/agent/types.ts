export interface Agent {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  instruction: string | null;
  cliType: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
