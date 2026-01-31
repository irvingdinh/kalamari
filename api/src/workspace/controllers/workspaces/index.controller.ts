import { Controller, Get, Query } from '@nestjs/common';

import { PaginatedResponse, PaginationQueryDto } from '../../../core/dtos';
import { WorkspaceEntity } from '../../../core/entities/workspace.entity';
import { WorkspacesService } from '../../services/workspaces.service';

@Controller('/api/workspaces')
export class IndexController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  async invoke(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<WorkspaceEntity>> {
    return this.workspacesService.findAll(query.page, query.limit);
  }
}
