import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

import { ChatQueueEntity } from '../../core/entities/chat-queue.entity';
import { ChatEvents } from '../constants';
import { ChatQueueCreatedEvent } from '../dtos';

@Injectable()
@EventSubscriber()
export class ChatQueueSubscriber implements EntitySubscriberInterface<ChatQueueEntity> {
  constructor(
    dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return ChatQueueEntity;
  }

  afterInsert(event: InsertEvent<ChatQueueEntity>) {
    const entity = event.entity;
    this.eventEmitter.emit(
      ChatEvents.QUEUE_CREATED,
      new ChatQueueCreatedEvent(entity.chatId, entity.id),
    );
  }
}
