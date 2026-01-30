import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';

import { CliHealthStatus } from '../../../cli/adapters';
import { CliRegistryService } from '../../../cli/services/cli-registry.service';

@Controller('/api/health')
export class IndexController {
  constructor(private readonly cliRegistry: CliRegistryService) {}

  @Get()
  async invoke(@Res() res: Response) {
    res.status(HttpStatus.OK).json({
      clis: await this.getCliHealth(),
    });
  }

  private async getCliHealth(): Promise<CliHealthStatus[]> {
    const adapters = this.cliRegistry.getAll();
    return Promise.all(adapters.map((adapter) => adapter.getHealth()));
  }
}
