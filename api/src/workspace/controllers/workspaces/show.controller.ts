import { Controller, Get, Param } from '@nestjs/common';

import { WorkspaceEntity } from '../../../core/entities/workspace.entity';
import { WorkspacesService } from '../../services/workspaces.service';

@Controller('/api/workspaces')
export class ShowController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get(':id')
  async invoke(@Param('id') id: string): Promise<WorkspaceEntity> {
    return this.workspacesService.findOne(id);
  }
}
