import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { WorkspacesService } from '../../services/workspaces.service';

@ApiTags('workspaces')
@Controller('/api/workspaces')
export class DeleteController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a workspace',
    description:
      'Permanently deletes a workspace and all its associated chats and messages',
  })
  @ApiParam({ name: 'id', description: 'Workspace ID', example: 'abc123xyz' })
  @ApiResponse({ status: 204, description: 'Workspace deleted successfully' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async invoke(@Param('id') id: string): Promise<void> {
    return this.workspacesService.remove(id);
  }
}
