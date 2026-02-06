import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';

import { PaginatedResponse } from '../../core/dtos';
import { ChatEntity } from '../../core/entities/chat.entity';
import { ChatMessageEntity } from '../../core/entities/chat-message.entity';
import { ChatQueueEntity } from '../../core/entities/chat-queue.entity';
import { CreateChatMessageRequestDto } from '../dtos';
import { ChatsService } from './chats.service';

@Injectable()
export class ChatMessagesService {
  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepository: Repository<ChatMessageEntity>,
    @InjectRepository(ChatQueueEntity)
    private readonly queueRepository: Repository<ChatQueueEntity>,
    private readonly chatsService: ChatsService,
  ) {}

  async findAllByChat(
    chatId: string,
    page: number = 1,
    limit: number = 100,
  ): Promise<PaginatedResponse<ChatMessageEntity>> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException(`Chat with ID "${chatId}" not found`);
    }

    const [data, total] = await this.messageRepository.findAndCount({
      where: { chatId },
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
    chatId: string,
    dto: CreateChatMessageRequestDto,
  ): Promise<ChatMessageEntity> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException(`Chat with ID "${chatId}" not found`);
    }

    const isProcessing = await this.chatsService.checkIsProcessing(chatId);
    if (isProcessing) {
      throw new BadRequestException('Chat is currently processing');
    }

    const message = this.messageRepository.create({
      id: nanoid(),
      chatId,
      actorType: 'user',
      actorId: null,
      text: dto.text,
    });

    const savedMessage = await this.messageRepository.save(message);

    const queue = this.queueRepository.create({
      id: nanoid(),
      chatId,
      status: 'pending',
    });
    await this.queueRepository.save(queue);

    return savedMessage;
  }
}
