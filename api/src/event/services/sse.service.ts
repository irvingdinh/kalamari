import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { interval, map, merge, Observable, Subject, takeUntil } from 'rxjs';

import { ChatEvents } from '../constants';
import {
  ChatMessageCreatedEvent,
  ChatQueueCreatedEvent,
  SseMessageDto,
} from '../dtos';

const HEARTBEAT_INTERVAL_MS = 30_000;

@Injectable()
export class SseService implements OnModuleDestroy {
  private readonly eventStream$ = new Subject<SseMessageDto>();
  private readonly destroy$ = new Subject<void>();

  @OnEvent(ChatEvents.MESSAGE_CREATED)
  handleMessageCreated(event: ChatMessageCreatedEvent): void {
    this.eventStream$.next({
      type: ChatEvents.MESSAGE_CREATED,
      payload: {
        chatId: event.chatId,
        messageId: event.messageId,
      },
    });
  }

  @OnEvent(ChatEvents.QUEUE_CREATED)
  handleQueueCreated(event: ChatQueueCreatedEvent): void {
    this.eventStream$.next({
      type: ChatEvents.QUEUE_CREATED,
      payload: {
        chatId: event.chatId,
        queueId: event.queueId,
      },
    });
  }

  getEventStream(): Observable<MessageEvent> {
    const events$ = this.eventStream$
      .asObservable()
      .pipe(map((data) => ({ data }) as MessageEvent));

    const heartbeat$ = interval(HEARTBEAT_INTERVAL_MS).pipe(
      map(() => ({ data: { type: 'heartbeat' } }) as MessageEvent),
    );

    return merge(events$, heartbeat$).pipe(takeUntil(this.destroy$));
  }

  onModuleDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.eventStream$.complete();
  }
}
