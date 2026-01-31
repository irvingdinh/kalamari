import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ChatQueueEntity } from '../../core/entities/chat-queue.entity';
import { ChatEvents } from '../../events/constants';
import { ChatQueueCreatedEvent } from '../../events/dtos';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    @InjectRepository(ChatQueueEntity)
    private readonly queueRepository: Repository<ChatQueueEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.rescheduleIncompleteQueues();
  }

  private async rescheduleIncompleteQueues(): Promise<void> {
    const incompleteQueues = await this.queueRepository.find({
      where: { status: In(['pending', 'in_progress']) },
      order: { createdAt: 'ASC' },
    });

    if (incompleteQueues.length === 0) {
      return;
    }

    this.logger.log(
      `Found ${incompleteQueues.length} incomplete queue(s), rescheduling...`,
    );

    for (const queue of incompleteQueues) {
      if (queue.status === 'in_progress') {
        await this.queueRepository.update(
          { id: queue.id },
          { status: 'pending' },
        );
      }

      this.eventEmitter.emit(
        ChatEvents.QUEUE_CREATED,
        new ChatQueueCreatedEvent(queue.chatId, queue.id),
      );
    }

    this.logger.log('Rescheduled all incomplete queues');
  }
}
