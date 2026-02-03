import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

import { TaskQueueEntity } from '../../core/entities/task-queue.entity';
import { TaskEvents } from '../constants';
import { TaskQueueCreatedEvent } from '../dtos';

@Injectable()
@EventSubscriber()
export class TaskQueueSubscriber implements EntitySubscriberInterface<TaskQueueEntity> {
  constructor(
    dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return TaskQueueEntity;
  }

  afterInsert(event: InsertEvent<TaskQueueEntity>) {
    const entity = event.entity;
    this.eventEmitter.emit(
      TaskEvents.QUEUE_CREATED,
      new TaskQueueCreatedEvent(entity.taskId, entity.id),
    );
  }
}
