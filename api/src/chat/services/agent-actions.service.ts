import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';

import { ChatMessageEntity } from '../../core/entities/chat-message.entity';
import { MessageActionHandler } from '../agent-actions/message.action';
import {
  ActionContext,
  AgentAction,
  AgentActionHandler,
} from '../agent-actions/types';

@Injectable()
export class AgentActionsService {
  private readonly logger = new Logger(AgentActionsService.name);
  private readonly handlers: Map<string, AgentActionHandler>;

  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepository: Repository<ChatMessageEntity>,
    private readonly messageActionHandler: MessageActionHandler,
  ) {
    this.handlers = new Map();
    this.registerHandler(this.messageActionHandler);
  }

  private registerHandler(handler: AgentActionHandler): void {
    this.handlers.set(handler.actionType, handler);
  }

  async processActions(
    actions: AgentAction[],
    context: ActionContext,
  ): Promise<void> {
    for (const action of actions) {
      const handler = this.handlers.get(action.action);

      if (!handler) {
        this.logger.warn(`No handler found for action type: ${action.action}`);
        await this.createSystemErrorMessage(
          context.chatId,
          `Unsupported action type: ${action.action}`,
        );
        continue;
      }

      try {
        const result = await handler.execute(action, context);

        if (!result.success) {
          this.logger.warn(`Action ${action.action} failed: ${result.error}`);
          await this.createSystemErrorMessage(
            context.chatId,
            `Failed to process action "${action.action}": ${result.error}`,
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Error executing action ${action.action}: ${errorMessage}`,
        );
        await this.createSystemErrorMessage(
          context.chatId,
          `Error processing action "${action.action}": ${errorMessage}`,
        );
      }
    }
  }

  async createSystemErrorMessage(chatId: string, text: string): Promise<void> {
    const message = this.messageRepository.create({
      id: nanoid(),
      chatId,
      actorType: 'system',
      actorId: null,
      text,
    });

    await this.messageRepository.save(message);
  }
}
