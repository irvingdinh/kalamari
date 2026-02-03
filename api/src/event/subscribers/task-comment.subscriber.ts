import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

import { TaskCommentEntity } from '../../core/entities/task-comment.entity';
import { TaskEvents } from '../constants';
import { TaskCommentCreatedEvent } from '../dtos';

@Injectable()
@EventSubscriber()
export class TaskCommentSubscriber implements EntitySubscriberInterface<TaskCommentEntity> {
  constructor(
    dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return TaskCommentEntity;
  }

  afterInsert(event: InsertEvent<TaskCommentEntity>) {
    const entity = event.entity;
    this.eventEmitter.emit(
      TaskEvents.COMMENT_CREATED,
      new TaskCommentCreatedEvent(entity.taskId, entity.id),
    );
  }
}
