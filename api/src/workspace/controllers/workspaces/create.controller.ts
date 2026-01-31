import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { WorkspaceEntity } from '../../../core/entities/workspace.entity';
import { CreateWorkspaceDto } from '../../dtos';
import { WorkspacesService } from '../../services/workspaces.service';

@Controller('/api/workspaces')
export class CreateController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async invoke(@Body() dto: CreateWorkspaceDto): Promise<WorkspaceEntity> {
    return this.workspacesService.create(dto);
  }
}
