export const CLI_TYPES = [
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
  { value: "codex", label: "Codex" },
] as const;

export type CliType = (typeof CLI_TYPES)[number]["value"];

export const TASK_STATUSES = [
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In Progress" },
  { value: "wait_for_review", label: "Wait for Review" },
  { value: "completed", label: "Completed" },
] as const;

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
