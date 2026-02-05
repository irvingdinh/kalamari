export const TaskStatus = {
  BACKLOG: "backlog",
  IN_PROGRESS: "in_progress",
  WAIT_FOR_REVIEW: "wait_for_review",
  COMPLETED: "completed",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

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
