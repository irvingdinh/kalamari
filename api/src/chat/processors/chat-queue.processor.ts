import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';

import { AppConfig } from '../../core/config/config';
import { ChatMessageEntity } from '../../core/entities/chat-message.entity';
import { ChatQueueEntity } from '../../core/entities/chat-queue.entity';
import { ChatEvents } from '../../event/constants';
import { ChatQueueCreatedEvent } from '../../event/dtos';

@Injectable()
export class ChatQueueProcessor {
  private readonly logger = new Logger(ChatQueueProcessor.name);
  private readonly isDisabled: boolean;

  constructor(
    @InjectRepository(ChatQueueEntity)
    private readonly queueRepository: Repository<ChatQueueEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepository: Repository<ChatMessageEntity>,
    private readonly configService: ConfigService,
  ) {
    this.isDisabled =
      this.configService.get<AppConfig>('root')?.processor.disabled ?? false;
  }

  @OnEvent(ChatEvents.QUEUE_CREATED)
  handleQueueCreated(event: ChatQueueCreatedEvent): void {
    void this.processQueue(event.queueId);
  }

  // TODO: This is a placeholder processor.
  private async processQueue(queueId: string): Promise<void> {
    if (this.isDisabled) {
      return;
    }

    try {
      const queue = await this.queueRepository.findOne({
        where: { id: queueId },
      });

      if (!queue) {
        this.logger.warn(`Queue ${queueId} not found`);
        return;
      }

      if (queue.status !== 'pending') {
        this.logger.debug(
          `Queue ${queueId} status is ${queue.status}, skipping`,
        );
        return;
      }

      await this.queueRepository.update(
        { id: queueId },
        { status: 'in_progress' },
      );

      const message = this.messageRepository.create({
        id: nanoid(),
        chatId: queue.chatId,
        actorType: 'agent',
        actorId: null,
        text: 'Placeholder response, the processor worked!',
      });

      await this.messageRepository.save(message);

      await this.queueRepository.update(
        { id: queueId },
        { status: 'completed' },
      );

      this.logger.debug(`Queue ${queueId} completed successfully`);
    } catch (error) {
      this.logger.error(`Error processing queue ${queueId}:`, error);

      await this.queueRepository.update({ id: queueId }, { status: 'failed' });

      const queue = await this.queueRepository.findOne({
        where: { id: queueId },
      });

      if (queue) {
        const systemMessage = this.messageRepository.create({
          id: nanoid(),
          chatId: queue.chatId,
          actorType: 'system',
          actorId: null,
          text: `Error processing message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });

        await this.messageRepository.save(systemMessage);
      }
    }
  }
}
