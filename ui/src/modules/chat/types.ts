export type CliType = "claude" | "gemini" | "codex";

export interface Chat {
  id: string;
  workspaceId: string;
  name: string;
  agentId: string | null;
  cliType: CliType | null;
  isProcessing: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  actorType: "user" | "agent" | "system";
  actorId: string | null;
  text: string;
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
