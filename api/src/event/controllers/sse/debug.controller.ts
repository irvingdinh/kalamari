import { Controller, Sse } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { DebugSseService } from '../../services/debug-sse.service';

@ApiTags('sse')
@Controller('/api/sse/debug')
export class DebugController {
  constructor(private readonly debugSseService: DebugSseService) {}

  @Sse()
  @ApiOperation({
    summary: 'Subscribe to debug server-sent events',
    description:
      'Opens an SSE connection to receive real-time debug events for CLI output. ' +
      'Heartbeat sent every 30 seconds.',
  })
  subscribe(): Observable<MessageEvent> {
    return this.debugSseService.getEventStream();
  }
}
