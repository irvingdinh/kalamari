export const TaskStatus = {
  BACKLOG: "backlog",
  IN_PROGRESS: "in_progress",
  WAIT_FOR_REVIEW: "wait_for_review",
  COMPLETED: "completed",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskStatusOptions = [
  { value: TaskStatus.BACKLOG, label: "Backlog" },
  { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
  { value: TaskStatus.WAIT_FOR_REVIEW, label: "Wait for Review" },
  { value: TaskStatus.COMPLETED, label: "Completed" },
] as const;

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
