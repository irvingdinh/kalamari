import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

import { ChatMessageEntity } from '../../core/entities/chat-message.entity';
import { ChatEvents } from '../constants';
import { ChatMessageCreatedEvent } from '../dtos';

@Injectable()
@EventSubscriber()
export class ChatMessageSubscriber implements EntitySubscriberInterface<ChatMessageEntity> {
  constructor(
    dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return ChatMessageEntity;
  }

  afterInsert(event: InsertEvent<ChatMessageEntity>) {
    const entity = event.entity;
    this.eventEmitter.emit(
      ChatEvents.MESSAGE_CREATED,
      new ChatMessageCreatedEvent(entity.chatId, entity.id),
    );
  }
}
