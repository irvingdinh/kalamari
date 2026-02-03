export enum TaskStatus {
  BACKLOG = 'backlog',
  IN_PROGRESS = 'in_progress',
  WAIT_FOR_REVIEW = 'wait_for_review',
  COMPLETED = 'completed',
}

export const TASK_STATUS_VALUES = Object.values(TaskStatus);

export enum TaskCommentActorType {
  USER = 'user',
  AGENT = 'agent',
  SYSTEM = 'system',
}

export const TASK_COMMENT_ACTOR_TYPE_VALUES =
  Object.values(TaskCommentActorType);

export interface TaskContextFile {
  task: {
    id: string;
    workspaceId: string;
    summary: string;
    description: string | null;
    status: string;
    lastActivityAt: Date;
    createdAt: Date;
    updatedAt: Date;
  };
  workspace: {
    id: string;
    name: string;
    description: string | null;
    workingDirectory: string | null;
  };
  agents: {
    id: string;
    name: string;
    description: string | null;
    cliType: string;
  }[];
}

export interface TaskCommentLine {
  actorType: string;
  actorId: string | null;
  text: string;
  createdAt: Date;
}
