import { ChatMessageSubscriber } from './chat-message.subscriber';
import { ChatQueueSubscriber } from './chat-queue.subscriber';
import { TaskCommentSubscriber } from './task-comment.subscriber';
import { TaskQueueSubscriber } from './task-queue.subscriber';

export const subscribers = [
  ChatMessageSubscriber,
  ChatQueueSubscriber,
  TaskCommentSubscriber,
  TaskQueueSubscriber,
];
