import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';

import { PaginatedResponse } from '../../core/dtos';
import { TaskEntity } from '../../core/entities/task.entity';
import { TaskCommentEntity } from '../../core/entities/task-comment.entity';
import { TaskEvents } from '../../event/constants';
import { TaskQueueCreatedEvent } from '../../event/dtos';
import { CreateTaskCommentRequestDto } from '../dtos';
import { TaskCommentActorType } from '../types';

@Injectable()
export class TaskCommentsService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(TaskCommentEntity)
    private readonly taskCommentRepository: Repository<TaskCommentEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAllByTask(
    taskId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<TaskCommentEntity>> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });

    if (!task) {
      throw new NotFoundException(`Task with ID "${taskId}" not found`);
    }

    const [data, total] = await this.taskCommentRepository.findAndCount({
      where: { taskId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(
    taskId: string,
    dto: CreateTaskCommentRequestDto,
  ): Promise<TaskCommentEntity> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });

    if (!task) {
      throw new NotFoundException(`Task with ID "${taskId}" not found`);
    }

    const comment = this.taskCommentRepository.create({
      id: nanoid(),
      taskId,
      actorType: TaskCommentActorType.USER,
      actorId: null,
      text: dto.text,
    });

    const savedComment = await this.taskCommentRepository.save(comment);

    this.eventEmitter.emit(
      TaskEvents.QUEUE_CREATED,
      new TaskQueueCreatedEvent(taskId),
    );

    return savedComment;
  }
}
