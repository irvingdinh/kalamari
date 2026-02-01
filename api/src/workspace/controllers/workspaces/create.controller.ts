import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { WorkspaceEntity } from '../../../core/entities/workspace.entity';
import { CreateWorkspaceRequestDto, WorkspaceResponseDto } from '../../dtos';
import { WorkspacesService } from '../../services/workspaces.service';

@ApiTags('workspaces')
@Controller('/api/workspaces')
export class CreateController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a workspace',
    description:
      'Creates a new workspace for organizing chats and AI interactions',
  })
  @ApiBody({ type: CreateWorkspaceRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Workspace created successfully',
    type: WorkspaceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async invoke(
    @Body() dto: CreateWorkspaceRequestDto,
  ): Promise<WorkspaceEntity> {
    return this.workspacesService.create(dto);
  }
}
