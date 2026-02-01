import { AgentActionsService } from './agent-actions.service';
import { BootstrapService } from './bootstrap.service';
import { ChatMessagesService } from './chat-messages.service';
import { ChatsService } from './chats.service';

export const services = [
  ChatsService,
  ChatMessagesService,
  BootstrapService,
  AgentActionsService,
];
