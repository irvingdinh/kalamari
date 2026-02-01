import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatEntity } from '../../core/entities/chat.entity';
import { ChatEvents } from '../../event/constants';
import { ChatMessageCreatedEvent } from '../../event/dtos';

@Injectable()
export class ChatProcessor {
  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
  ) {}

  @OnEvent(ChatEvents.MESSAGE_CREATED)
  async handleMessageCreated(event: ChatMessageCreatedEvent): Promise<void> {
    await this.chatRepository.update(
      { id: event.chatId },
      { updatedAt: new Date() },
    );
  }
}
