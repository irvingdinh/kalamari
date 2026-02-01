import { Controller, Sse } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { SseService } from '../../services/sse.service';

@ApiTags('sse')
@Controller('/api/sse')
export class IndexController {
  constructor(private readonly sseService: SseService) {}

  @Sse()
  @ApiOperation({
    summary: 'Subscribe to server-sent events',
    description:
      'Opens an SSE connection to receive real-time events for chat messages and queue updates. ' +
      'Clients should reconnect on disconnect. Heartbeat sent every 30 seconds.',
  })
  subscribe(): Observable<MessageEvent> {
    return this.sseService.getEventStream();
  }
}
