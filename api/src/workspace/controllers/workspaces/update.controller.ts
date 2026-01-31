import { Body, Controller, Param, Patch } from '@nestjs/common';

import { WorkspaceEntity } from '../../../core/entities/workspace.entity';
import { UpdateWorkspaceDto } from '../../dtos';
import { WorkspacesService } from '../../services/workspaces.service';

@Controller('/api/workspaces')
export class UpdateController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Patch(':id')
  async invoke(
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
  ): Promise<WorkspaceEntity> {
    return this.workspacesService.update(id, dto);
  }
}
