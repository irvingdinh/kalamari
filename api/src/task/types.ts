export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  Done = 'done',
}

export const TASK_STATUS_VALUES = Object.values(TaskStatus);

export enum TaskQueueStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

export const TASK_QUEUE_STATUS_VALUES = Object.values(TaskQueueStatus);
