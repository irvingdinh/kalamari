import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TaskEntity } from '../../core/entities/task.entity';
import { TaskEvents } from '../../event/constants';
import { TaskQueueCreatedEvent } from '../../event/dtos';
import { TaskStatus } from '../types';

@Injectable()
export class TaskQueueProcessor {
  private readonly logger = new Logger(TaskQueueProcessor.name);

  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
  ) {}

  @OnEvent(TaskEvents.QUEUE_CREATED)
  handleQueueCreated(event: TaskQueueCreatedEvent): void {
    void this.processTask(event.taskId);
  }

  private async processTask(taskId: string): Promise<void> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id: taskId },
      });

      if (!task) {
        this.logger.warn(`Task ${taskId} not found`);
        return;
      }

      await this.taskRepository.update(
        { id: taskId },
        {
          status: TaskStatus.WAIT_FOR_REVIEW,
          lastActivityAt: new Date(),
        },
      );

      this.logger.debug(
        `Task ${taskId} status updated to ${TaskStatus.WAIT_FOR_REVIEW}`,
      );
    } catch (error) {
      this.logger.error(`Error processing task ${taskId}:`, error);
    }
  }
}
