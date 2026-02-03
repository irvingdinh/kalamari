import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';

import { AgentEntity } from '../../core/entities/agent.entity';
import { WorkspaceEntity } from '../../core/entities/workspace.entity';
import {
  CreateAgentRequestDto,
  ReorderAgentsRequestDto,
  UpdateAgentRequestDto,
} from '../dtos';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async findAll(workspaceId?: string): Promise<AgentEntity[]> {
    const whereClause = workspaceId ? { workspaceId } : {};

    return this.agentRepository.find({
      where: whereClause,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AgentEntity> {
    const agent = await this.agentRepository.findOne({ where: { id } });

    if (!agent) {
      throw new NotFoundException(`Agent with ID "${id}" not found`);
    }

    return agent;
  }

  async create(
    workspaceId: string,
    dto: CreateAgentRequestDto,
  ): Promise<AgentEntity> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException(
        `Workspace with ID "${workspaceId}" not found`,
      );
    }

    const maxResult = await this.agentRepository
      .createQueryBuilder('agent')
      .select('MAX(agent.sortOrder)', 'max')
      .where('agent.workspaceId = :workspaceId', {
        workspaceId,
      })
      .getRawOne();

    const sortOrder = (maxResult?.max ?? -1) + 1;

    const agent = this.agentRepository.create({
      id: nanoid(),
      workspaceId,
      name: dto.name,
      description: dto.description ?? null,
      instruction: dto.instruction ?? null,
      cliType: dto.cliType,
      sortOrder,
    });

    return this.agentRepository.save(agent);
  }

  async update(id: string, dto: UpdateAgentRequestDto): Promise<AgentEntity> {
    const agent = await this.agentRepository.findOne({ where: { id } });

    if (!agent) {
      throw new NotFoundException(`Agent with ID "${id}" not found`);
    }

    if (dto.name !== undefined) {
      agent.name = dto.name;
    }
    if (dto.description !== undefined) {
      agent.description = dto.description;
    }
    if (dto.instruction !== undefined) {
      agent.instruction = dto.instruction;
    }
    if (dto.cliType !== undefined) {
      agent.cliType = dto.cliType;
    }

    return this.agentRepository.save(agent);
  }

  async remove(id: string): Promise<void> {
    const agent = await this.agentRepository.findOne({ where: { id } });

    if (!agent) {
      throw new NotFoundException(`Agent with ID "${id}" not found`);
    }

    await this.agentRepository.remove(agent);
  }

  async reorder(
    workspaceId: string,
    dto: ReorderAgentsRequestDto,
  ): Promise<AgentEntity[]> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException(
        `Workspace with ID "${workspaceId}" not found`,
      );
    }

    const agents = await this.agentRepository.find({
      where: { workspaceId },
    });

    // Check for duplicates
    const uniqueIds = new Set(dto.agentIds);
    if (uniqueIds.size !== dto.agentIds.length) {
      throw new BadRequestException('Duplicate agent IDs provided');
    }

    // Check that all workspace agents are included
    const existingIds = new Set(agents.map((a) => a.id));
    if (agents.length !== dto.agentIds.length) {
      throw new BadRequestException(
        'Agent IDs count does not match workspace agents count',
      );
    }

    // Check that all provided IDs belong to this workspace
    for (const id of dto.agentIds) {
      if (!existingIds.has(id)) {
        throw new BadRequestException(
          `Agent with ID "${id}" not found in workspace`,
        );
      }
    }

    // Update only sortOrder for each agent to avoid overwriting concurrent changes
    for (let i = 0; i < dto.agentIds.length; i++) {
      await this.agentRepository.update(dto.agentIds[i], { sortOrder: i });
    }

    return this.findAll(workspaceId);
  }
}
