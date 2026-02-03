import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { FindOptionsWhere, Repository } from 'typeorm';

import { PaginatedResponse } from '../../core/dtos';
import { TaskEntity } from '../../core/entities/task.entity';
import { WorkspaceEntity } from '../../core/entities/workspace.entity';
import { CreateTaskRequestDto, UpdateTaskRequestDto } from '../dtos';
import { TaskStatus } from '../types';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    workspaceId?: string,
    status?: TaskStatus,
  ): Promise<PaginatedResponse<TaskEntity>> {
    const whereClause: FindOptionsWhere<TaskEntity> = {};

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
      description: dto.description ?? null,
      status: dto.status ?? TaskStatus.BACKLOG,
      lastActivityAt: new Date(),
    });

    return this.taskRepository.save(task);
  }

  async update(id: string, dto: UpdateTaskRequestDto): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    let hasChanges = false;

    if (dto.summary !== undefined && dto.summary !== task.summary) {
      task.summary = dto.summary;
      hasChanges = true;
    }
    if (dto.description !== undefined && dto.description !== task.description) {
      task.description = dto.description;
      hasChanges = true;
    }
    if (dto.status !== undefined && dto.status !== task.status) {
      task.status = dto.status;
      hasChanges = true;
    }

    if (!hasChanges) {
      return task;
    }

    task.lastActivityAt = new Date();

    return this.taskRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    await this.taskRepository.remove(task);
  }
}
