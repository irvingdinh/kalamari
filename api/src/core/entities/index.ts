import { AgentEntity } from './agent.entity';
import { ChatEntity } from './chat.entity';
import { ChatMessageEntity } from './chat-message.entity';
import { ChatQueueEntity } from './chat-queue.entity';
import { TaskEntity } from './task.entity';
import { TaskCommentEntity } from './task-comment.entity';
import { TaskQueueEntity } from './task-queue.entity';
import { WorkspaceEntity } from './workspace.entity';

export const entities = [
  AgentEntity,
  ChatEntity,
  ChatMessageEntity,
  ChatQueueEntity,
  TaskEntity,
  TaskCommentEntity,
  TaskQueueEntity,
  WorkspaceEntity,
];
