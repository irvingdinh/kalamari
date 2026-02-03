import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TaskEntity } from '../../core/entities/task.entity';
import { TaskEvents } from '../../event/constants';
import { TaskCommentCreatedEvent } from '../../event/dtos';

@Injectable()
export class TaskProcessor {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
  ) {}

  @OnEvent(TaskEvents.COMMENT_CREATED)
  async handleCommentCreated(event: TaskCommentCreatedEvent): Promise<void> {
    await this.taskRepository.update(
      { id: event.taskId },
      { lastActivityAt: new Date() },
    );
  }
}
