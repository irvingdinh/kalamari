import { Module } from '@nestjs/common';

import { CliModule } from '../cli/cli.module';
import { CoreModule } from '../core/core.module';
import { controllers } from './controllers';

@Module({
  imports: [CliModule, CoreModule],
  controllers: [...controllers],
})
export class HealthModule {}
