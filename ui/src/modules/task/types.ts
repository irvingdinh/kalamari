export type TaskStatus =
  | "backlog"
  | "in_progress"
  | "wait_for_review"
  | "completed";

export interface Task {
  id: string;
  workspaceId: string;
  summary: string;
  description: string | null;
  status: TaskStatus;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
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
