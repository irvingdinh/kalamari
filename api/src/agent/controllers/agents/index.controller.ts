import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AgentEntity } from '../../../core/entities/agent.entity';
import { AgentResponseDto, ListAgentsQueryRequestDto } from '../../dtos';
import { AgentsService } from '../../services/agents.service';

@ApiTags('agents')
@Controller('/api/agents')
export class IndexController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  @ApiOperation({
    summary: 'List agents',
    description:
      'Returns a list of all agents, optionally filtered by workspace ID. Sorted by sort_order ASC, created_at DESC.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of agents',
    type: [AgentResponseDto],
  })
  async invoke(
    @Query() query: ListAgentsQueryRequestDto,
  ): Promise<AgentEntity[]> {
    return this.agentsService.findAll(query.workspace_id);
  }
}
