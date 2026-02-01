import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { WorkspaceEntity } from '../../../core/entities/workspace.entity';
import { WorkspaceResponse } from '../../../core/responses';
import { WorkspacesService } from '../../services/workspaces.service';

@ApiTags('workspaces')
@Controller('/api/workspaces')
export class ShowController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get a workspace',
    description: 'Retrieves a single workspace by its ID',
  })
  @ApiParam({ name: 'id', description: 'Workspace ID', example: 'abc123xyz' })
  @ApiResponse({
    status: 200,
    description: 'Workspace found',
    type: WorkspaceResponse,
  })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async invoke(@Param('id') id: string): Promise<WorkspaceEntity> {
    return this.workspacesService.findOne(id);
  }
}
