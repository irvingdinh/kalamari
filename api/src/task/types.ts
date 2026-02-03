export enum TaskStatus {
  BACKLOG = 'backlog',
  IN_PROGRESS = 'in_progress',
  WAIT_FOR_REVIEW = 'wait_for_review',
  COMPLETED = 'completed',
}

export const TASK_STATUS_VALUES = Object.values(TaskStatus);
