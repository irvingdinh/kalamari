import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { DataSource, Repository } from 'typeorm';

import { TaskQueueEntity } from '../../core/entities/task-queue.entity';
import { TaskQueueStatus } from '../types';

@Injectable()
export class TaskQueuesService {
  constructor(
    @InjectRepository(TaskQueueEntity)
    private readonly queueRepository: Repository<TaskQueueEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(taskId: string): Promise<TaskQueueEntity | null> {
    const id = nanoid();

    await this.dataSource.query(
      `INSERT INTO task_queues (id, task_id, status, priority, created_at)
       SELECT ?, ?, ?, 0, datetime('now')
       WHERE NOT EXISTS (
         SELECT 1 FROM task_queues WHERE task_id = ? AND status IN (?, ?)
       )`,
      [
        id,
        taskId,
        TaskQueueStatus.Pending,
        taskId,
        TaskQueueStatus.Pending,
        TaskQueueStatus.InProgress,
      ],
    );

    return this.queueRepository.findOneBy({ id });
  }
}
