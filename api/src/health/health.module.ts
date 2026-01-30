import { Module } from '@nestjs/common';

import { CoreModule } from '../core/core.module';
import { controllers } from './controllers';

@Module({
  imports: [CoreModule],
  controllers: [...controllers],
})
export class HealthModule {}
