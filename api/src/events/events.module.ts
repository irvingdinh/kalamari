import { Module } from '@nestjs/common';

import { subscribers } from './subscribers';

@Module({
  providers: [...subscribers],
})
export class EventsModule {}
