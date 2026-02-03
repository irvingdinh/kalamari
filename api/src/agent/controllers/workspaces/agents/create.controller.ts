import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AgentEntity } from '../../../../core/entities/agent.entity';
import { AgentResponseDto, CreateAgentRequestDto } from '../../../dtos';
import { AgentsService } from '../../../services/agents.service';

@ApiTags('agents')
@Controller('/api/workspaces/:workspaceId/agents')
export class CreateController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create an agent',
    description: 'Creates a new agent in the specified workspace',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID',
    example: 'ws_abc123',
  })
  @ApiBody({ type: CreateAgentRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Agent created successfully',
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async invoke(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateAgentRequestDto,
  ): Promise<AgentEntity> {
    return this.agentsService.create(workspaceId, dto);
  }
}
