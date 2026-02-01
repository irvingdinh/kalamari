export interface ChatContextFile {
  chat: {
    id: string;
    name: string;
    workspaceId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  workspace: {
    id: string;
    name: string;
    description: string | null;
    workingDirectory: string | null;
  };
}

export interface ChatMessageLine {
  actorType: string;
  text: string;
  createdAt: Date;
}
