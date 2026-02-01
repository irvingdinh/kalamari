import { Body, Controller, Param, Patch } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { WorkspaceEntity } from '../../../core/entities/workspace.entity';
import { WorkspaceResponse } from '../../../core/responses';
import { UpdateWorkspaceDto } from '../../dtos';
import { WorkspacesService } from '../../services/workspaces.service';

@ApiTags('workspaces')
@Controller('/api/workspaces')
export class UpdateController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a workspace',
    description:
      'Updates an existing workspace. Only provided fields will be updated.',
  })
  @ApiParam({ name: 'id', description: 'Workspace ID', example: 'abc123xyz' })
  @ApiBody({ type: UpdateWorkspaceDto })
  @ApiResponse({
    status: 200,
    description: 'Workspace updated successfully',
    type: WorkspaceResponse,
  })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async invoke(
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
  ): Promise<WorkspaceEntity> {
    return this.workspacesService.update(id, dto);
  }
}
