import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  PaginatedResponse,
  PaginationQueryRequestDto,
} from '../../../core/dtos';
import { WorkspaceEntity } from '../../../core/entities/workspace.entity';
import { PaginatedWorkspaceResponseDto } from '../../dtos';
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
    type: PaginatedWorkspaceResponseDto,
  })
  async invoke(
    @Query() query: PaginationQueryRequestDto,
  ): Promise<PaginatedResponse<WorkspaceEntity>> {
    return this.workspacesService.findAll(query.page, query.limit);
  }
}
