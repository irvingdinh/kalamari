import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';

import { PaginatedResponse } from '../../core/dtos';
import { WorkspaceEntity } from '../../core/entities/workspace.entity';
import { CreateWorkspaceRequestDto, UpdateWorkspaceRequestDto } from '../dtos';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<WorkspaceEntity>> {
    const [data, total] = await this.workspaceRepository.findAndCount({
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

  async findOne(id: string): Promise<WorkspaceEntity> {
    const workspace = await this.workspaceRepository.findOne({ where: { id } });

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID "${id}" not found`);
    }

    return workspace;
  }

  async create(dto: CreateWorkspaceRequestDto): Promise<WorkspaceEntity> {
    const workspace = this.workspaceRepository.create({
      id: nanoid(),
      name: dto.name,
      description: dto.description ?? null,
      workingDirectory: dto.workingDirectory ?? null,
    });

    return this.workspaceRepository.save(workspace);
  }

  async update(
    id: string,
    dto: UpdateWorkspaceRequestDto,
  ): Promise<WorkspaceEntity> {
    const workspace = await this.findOne(id);

    if (dto.name !== undefined) {
      workspace.name = dto.name;
    }
    if (dto.description !== undefined) {
      workspace.description = dto.description;
    }
    if (dto.workingDirectory !== undefined) {
      workspace.workingDirectory = dto.workingDirectory;
    }

    return this.workspaceRepository.save(workspace);
  }

  async remove(id: string): Promise<void> {
    const workspace = await this.findOne(id);

    await this.workspaceRepository.remove(workspace);
  }
}
