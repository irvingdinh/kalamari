import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';

import { PaginatedResponse } from '../../core/dtos';
import { TaskEntity } from '../../core/entities/task.entity';
import { TaskCommentEntity } from '../../core/entities/task-comment.entity';
import { CreateTaskCommentRequestDto } from '../dtos';
import { TaskQueuesService } from './task-queues.service';

@Injectable()
export class TaskCommentsService {
  constructor(
    @InjectRepository(TaskCommentEntity)
    private readonly commentRepository: Repository<TaskCommentEntity>,
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    private readonly taskQueuesService: TaskQueuesService,
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

    const [data, total] = await this.commentRepository.findAndCount({
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

    const comment = this.commentRepository.create({
      id: nanoid(),
      taskId,
      actorType: 'user',
      actorId: null,
      text: dto.text,
    });

    const savedComment = await this.commentRepository.save(comment);

    await this.taskQueuesService.create(taskId);

    return savedComment;
  }
}
