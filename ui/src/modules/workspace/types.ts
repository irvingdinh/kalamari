export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  workingDirectory: string | null;
  createdAt: string;
  updatedAt: string;
}
