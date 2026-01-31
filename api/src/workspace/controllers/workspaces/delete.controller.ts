import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';

import { WorkspacesService } from '../../services/workspaces.service';

@Controller('/api/workspaces')
export class DeleteController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async invoke(@Param('id') id: string): Promise<void> {
    return this.workspacesService.remove(id);
  }
}
