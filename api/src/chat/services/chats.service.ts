import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { In, Repository } from 'typeorm';

import { PaginatedResponse } from '../../core/dtos';
import { AgentEntity } from '../../core/entities/agent.entity';
import { ChatEntity } from '../../core/entities/chat.entity';
import { ChatQueueEntity } from '../../core/entities/chat-queue.entity';
import { WorkspaceEntity } from '../../core/entities/workspace.entity';
import {
  ChatWithProcessing,
  CreateChatRequestDto,
  UpdateChatRequestDto,
} from '../dtos';

export type { ChatWithProcessing } from '../dtos';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
    @InjectRepository(ChatQueueEntity)
    private readonly chatQueueRepository: Repository<ChatQueueEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 100,
    workspaceId?: string,
    include?: string,
  ): Promise<PaginatedResponse<ChatWithProcessing>> {
    const whereClause = workspaceId ? { workspaceId } : {};

    const includes = include?.split(',').map((s) => s.trim()) ?? [];
    const relations: string[] = [];
    if (includes.includes('workspace')) {
      relations.push('workspace');
    }

    const [data, total] = await this.chatRepository.findAndCount({
      where: whereClause,
      relations: relations.length > 0 ? relations : undefined,
      skip: (page - 1) * limit,
      take: limit,
      order: { updatedAt: 'DESC' },
    });

    const chatsWithProcessing = await this.addProcessingStatus(data);

    return {
      data: chatsWithProcessing,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ChatWithProcessing> {
    const chat = await this.chatRepository.findOne({ where: { id } });

    if (!chat) {
      throw new NotFoundException(`Chat with ID "${id}" not found`);
    }

    const isProcessing = await this.checkIsProcessing(id);

    return { ...chat, isProcessing };
  }

  async create(
    workspaceId: string,
    dto?: CreateChatRequestDto,
  ): Promise<ChatWithProcessing> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException(
        `Workspace with ID "${workspaceId}" not found`,
      );
    }

    if (dto?.agentId) {
      await this.validateAgent(dto.agentId, workspaceId);
    }

    const chat = this.chatRepository.create({
      id: nanoid(),
      workspaceId,
      name: dto?.name ?? 'Untitled chat',
      agentId: dto?.agentId ?? null,
      cliType: dto?.cliType ?? null,
    });

    const savedChat = await this.chatRepository.save(chat);

    return { ...savedChat, isProcessing: false };
  }

  async update(
    id: string,
    dto: UpdateChatRequestDto,
  ): Promise<ChatWithProcessing> {
    const chat = await this.chatRepository.findOne({ where: { id } });

    if (!chat) {
      throw new NotFoundException(`Chat with ID "${id}" not found`);
    }

    if (dto.name !== undefined) {
      chat.name = dto.name;
    }

    if (dto.agentId !== undefined) {
      if (dto.agentId !== null) {
        await this.validateAgent(dto.agentId, chat.workspaceId);
      }
      chat.agentId = dto.agentId;
    }

    if (dto.cliType !== undefined) {
      chat.cliType = dto.cliType;
    }

    const savedChat = await this.chatRepository.save(chat);
    const isProcessing = await this.checkIsProcessing(id);

    return { ...savedChat, isProcessing };
  }

  async remove(id: string): Promise<void> {
    const chat = await this.chatRepository.findOne({ where: { id } });

    if (!chat) {
      throw new NotFoundException(`Chat with ID "${id}" not found`);
    }

    await this.chatRepository.remove(chat);
  }

  async cancel(id: string): Promise<ChatWithProcessing> {
    const chat = await this.chatRepository.findOne({ where: { id } });

    if (!chat) {
      throw new NotFoundException(`Chat with ID "${id}" not found`);
    }

    const result = await this.chatQueueRepository.update(
      { chatId: id, status: In(['pending', 'in_progress']) },
      { status: 'cancelled' },
    );

    if (result.affected === 0) {
      throw new BadRequestException('Chat is not being processed');
    }

    return { ...chat, isProcessing: false };
  }

  async checkIsProcessing(chatId: string): Promise<boolean> {
    const count = await this.chatQueueRepository.count({
      where: {
        chatId,
        status: In(['pending', 'in_progress']),
      },
    });

    return count > 0;
  }

  private async validateAgent(
    agentId: string,
    workspaceId: string,
  ): Promise<void> {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID "${agentId}" not found`);
    }

    if (agent.workspaceId !== workspaceId) {
      throw new BadRequestException(
        'Agent does not belong to the same workspace as the chat',
      );
    }
  }

  private async addProcessingStatus(
    chats: ChatEntity[],
  ): Promise<ChatWithProcessing[]> {
    if (chats.length === 0) {
      return [];
    }

    const chatIds = chats.map((c) => c.id);

    const activeQueues = await this.chatQueueRepository
      .createQueryBuilder('queue')
      .select('queue.chatId', 'chatId')
      .where('queue.chatId IN (:...chatIds)', { chatIds })
      .andWhere('queue.status IN (:...statuses)', {
        statuses: ['pending', 'in_progress'],
      })
      .groupBy('queue.chatId')
      .getRawMany<{ chatId: string }>();

    const processingChatIds = new Set(activeQueues.map((q) => q.chatId));

    return chats.map((chat) => ({
      ...chat,
      isProcessing: processingChatIds.has(chat.id),
    }));
  }
}
