import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';

import { PaginatedResponse } from '../../core/dtos';
import { TaskEntity } from '../../core/entities/task.entity';
import { WorkspaceEntity } from '../../core/entities/workspace.entity';
import { CreateTaskRequestDto, UpdateTaskRequestDto } from '../dtos';
import { TaskStatus } from '../types';
import { TaskQueuesService } from './task-queues.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly taskQueuesService: TaskQueuesService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    workspaceId?: string,
    status?: string,
  ): Promise<PaginatedResponse<TaskEntity>> {
    const whereClause: Record<string, string> = {};
    if (workspaceId) {
      whereClause.workspaceId = workspaceId;
    }
    if (status) {
      whereClause.status = status;
    }

    const [data, total] = await this.taskRepository.findAndCount({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      order: { lastActivityAt: 'DESC' },
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

  async findOne(id: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return task;
  }

  async create(
    workspaceId: string,
    dto: CreateTaskRequestDto,
  ): Promise<TaskEntity> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException(
        `Workspace with ID "${workspaceId}" not found`,
      );
    }

    const task = this.taskRepository.create({
      id: nanoid(),
      workspaceId,
      summary: dto.summary,
      description: dto.description,
      status: TaskStatus.Todo,
      lastActivityAt: new Date(),
    });

    return this.taskRepository.save(task);
  }

  async update(id: string, dto: UpdateTaskRequestDto): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    let contentChanged = false;

    if (dto.summary !== undefined && dto.summary !== task.summary) {
      task.summary = dto.summary;
      contentChanged = true;
    }

    if (dto.description !== undefined && dto.description !== task.description) {
      task.description = dto.description;
      contentChanged = true;
    }

    if (dto.status !== undefined) {
      task.status = dto.status;
    }

    if (contentChanged) {
      task.lastActivityAt = new Date();
    }

    const savedTask = await this.taskRepository.save(task);

    if (contentChanged) {
      await this.taskQueuesService.create(id);
    }

    return savedTask;
  }

  async remove(id: string): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    await this.taskRepository.remove(task);
  }
}
