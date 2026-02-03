import { Body, Controller, Param, Put } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AgentEntity } from '../../../../core/entities/agent.entity';
import { AgentResponseDto, ReorderAgentsRequestDto } from '../../../dtos';
import { AgentsService } from '../../../services/agents.service';

@ApiTags('agents')
@Controller('/api/workspaces/:workspaceId/agents')
export class ReorderController {
  constructor(private readonly agentsService: AgentsService) {}

  @Put('reorder')
  @ApiOperation({
    summary: 'Reorder agents',
    description:
      'Reorders all agents in a workspace. The array index becomes the new sort_order.',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID',
    example: 'ws_abc123',
  })
  @ApiBody({ type: ReorderAgentsRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Agents reordered successfully',
    type: [AgentResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid agent IDs (missing, extra, or duplicates)',
  })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async invoke(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: ReorderAgentsRequestDto,
  ): Promise<AgentEntity[]> {
    return this.agentsService.reorder(workspaceId, dto);
  }
}
