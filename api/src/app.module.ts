import { Module } from '@nestjs/common';

import { CliModule } from './cli/cli.module';
import { CoreModule } from './core/core.module';
import { HealthModule } from './health/health.module';
import { WorkspaceModule } from './workspace/workspace.module';

@Module({
  imports: [CliModule, CoreModule, HealthModule, WorkspaceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
