import { chatMessagesControllers } from './chat-messages';
import { chatsControllers } from './chats';

export const controllers = [...chatsControllers, ...chatMessagesControllers];
