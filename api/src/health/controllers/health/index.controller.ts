import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { CliHealthStatus } from '../../../cli/adapters';
import { CliRegistryService } from '../../../cli/services/cli-registry.service';
import { HealthResponse } from '../../../core/responses';
import { DirService } from '../../../core/services/dir.service';

@ApiTags('health')
@Controller('/api/health')
export class IndexController {
  constructor(
    private readonly cliRegistry: CliRegistryService,
    private readonly dirService: DirService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Check API health',
    description:
      'Returns the health status of all configured CLI adapters (Claude, Codex, Gemini, OpenCode)',
  })
  @ApiResponse({
    status: 200,
    description: 'Health status of all CLI adapters',
    type: HealthResponse,
  })
  async invoke(@Res() res: Response) {
    res.status(HttpStatus.OK).json({
      clis: await this.getCliHealth(),
    });
  }

  private async getCliHealth(): Promise<CliHealthStatus[]> {
    const cwd = this.dirService.ensureTempDir();
    const adapters = this.cliRegistry.getAll();
    return Promise.all(adapters.map((adapter) => adapter.getHealth(cwd)));
  }
}
