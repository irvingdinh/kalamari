import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PaginatedResponse, PaginationQueryDto } from '../../../core/dtos';
import { WorkspaceEntity } from '../../../core/entities/workspace.entity';
import { PaginatedWorkspaceResponse } from '../../../core/responses';
import { WorkspacesService } from '../../services/workspaces.service';

@ApiTags('workspaces')
@Controller('/api/workspaces')
export class IndexController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @ApiOperation({
    summary: 'List all workspaces',
    description: 'Returns a paginated list of all workspaces',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of workspaces',
    type: PaginatedWorkspaceResponse,
  })
  async invoke(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<WorkspaceEntity>> {
    return this.workspacesService.findAll(query.page, query.limit);
  }
}
