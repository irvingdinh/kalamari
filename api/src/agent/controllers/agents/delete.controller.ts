import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AgentsService } from '../../services/agents.service';

@ApiTags('agents')
@Controller('/api/agents')
export class DeleteController {
  constructor(private readonly agentsService: AgentsService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete an agent',
    description: 'Permanently deletes an agent',
  })
  @ApiParam({ name: 'id', description: 'Agent ID', example: 'agt_abc123' })
  @ApiResponse({ status: 204, description: 'Agent deleted successfully' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async invoke(@Param('id') id: string): Promise<void> {
    return this.agentsService.remove(id);
  }
}
