import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { TaskEntity } from '../../core/entities/task.entity';
import { TaskEvents } from '../../event/constants';
import { TaskQueueCreatedEvent } from '../../event/dtos';
import { TaskStatus } from '../types';

@Injectable()
export class TaskBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TaskBootstrapService.name);

  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.rescheduleIncompleteTasks();
  }

  private async rescheduleIncompleteTasks(): Promise<void> {
    const incompleteTasks = await this.taskRepository.find({
      where: { status: In([TaskStatus.BACKLOG, TaskStatus.IN_PROGRESS]) },
      order: { createdAt: 'ASC' },
    });

    if (incompleteTasks.length === 0) {
      return;
    }

    this.logger.log(
      `Found ${incompleteTasks.length} incomplete task(s), rescheduling...`,
    );

    for (const task of incompleteTasks) {
      this.eventEmitter.emit(
        TaskEvents.QUEUE_CREATED,
        new TaskQueueCreatedEvent(task.id),
      );
    }

    this.logger.log('Rescheduled all incomplete tasks');
  }
}
