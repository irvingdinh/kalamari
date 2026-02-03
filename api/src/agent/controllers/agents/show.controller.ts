import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AgentEntity } from '../../../core/entities/agent.entity';
import { AgentResponseDto } from '../../dtos';
import { AgentsService } from '../../services/agents.service';

@ApiTags('agents')
@Controller('/api/agents')
export class ShowController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get an agent',
    description: 'Retrieves a single agent by its ID',
  })
  @ApiParam({ name: 'id', description: 'Agent ID', example: 'agt_abc123' })
  @ApiResponse({
    status: 200,
    description: 'Agent found',
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async invoke(@Param('id') id: string): Promise<AgentEntity> {
    return this.agentsService.findOne(id);
  }
}
