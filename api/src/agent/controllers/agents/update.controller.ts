import { Body, Controller, Param, Patch } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AgentEntity } from '../../../core/entities/agent.entity';
import { AgentResponseDto, UpdateAgentRequestDto } from '../../dtos';
import { AgentsService } from '../../services/agents.service';

@ApiTags('agents')
@Controller('/api/agents')
export class UpdateController {
  constructor(private readonly agentsService: AgentsService) {}

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an agent',
    description:
      'Updates an existing agent. Only provided fields will be updated.',
  })
  @ApiParam({ name: 'id', description: 'Agent ID', example: 'agt_abc123' })
  @ApiBody({ type: UpdateAgentRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Agent updated successfully',
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async invoke(
    @Param('id') id: string,
    @Body() dto: UpdateAgentRequestDto,
  ): Promise<AgentEntity> {
    return this.agentsService.update(id, dto);
  }
}
