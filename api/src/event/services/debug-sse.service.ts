import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { interval, map, merge, Observable, Subject, takeUntil } from 'rxjs';

import { DebugEvents } from '../constants';
import type { DebugSseMessageDto } from '../dtos';

const HEARTBEAT_INTERVAL_MS = 30_000;

@Injectable()
export class DebugSseService implements OnModuleDestroy {
  private readonly eventStream$ = new Subject<DebugSseMessageDto>();
  private readonly destroy$ = new Subject<void>();

  @OnEvent(DebugEvents.CLI_OUTPUT)
  handleCliOutput(event: DebugSseMessageDto): void {
    this.eventStream$.next(event);
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
