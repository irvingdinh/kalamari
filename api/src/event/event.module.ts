import { Module } from '@nestjs/common';

import { controllers } from './controllers';
import { services } from './services';
import { subscribers } from './subscribers';

@Module({
  controllers: [...controllers],
  providers: [...services, ...subscribers],
})
export class EventsModule {}
