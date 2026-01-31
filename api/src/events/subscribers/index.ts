import { ChatMessageSubscriber } from './chat-message.subscriber';
import { ChatQueueSubscriber } from './chat-queue.subscriber';

export const subscribers = [ChatMessageSubscriber, ChatQueueSubscriber];
