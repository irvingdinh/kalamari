import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';

import { ChatMessageEntity } from '../../core/entities/chat-message.entity';
import {
  ActionContext,
  ActionResult,
  AgentActionHandler,
  MessageAction,
} from './types';

@Injectable()
export class MessageActionHandler implements AgentActionHandler<MessageAction> {
  readonly actionType = 'message';

  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepository: Repository<ChatMessageEntity>,
  ) {}

  async execute(
    action: MessageAction,
    context: ActionContext,
  ): Promise<ActionResult> {
    if (!action.text) {
      return {
        success: false,
        error: 'Message action requires a non-empty text field',
      };
    }

    const trimmedText = action.text.trim();
    if (trimmedText.length === 0) {
      return {
        success: false,
        error: 'Message action requires a non-empty text field',
      };
    }

    const message = this.messageRepository.create({
      id: nanoid(),
      chatId: context.chatId,
      actorType: 'agent',
      actorId: null,
      text: trimmedText,
    });

    await this.messageRepository.save(message);

    return { success: true };
  }
}
