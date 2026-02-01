import { Module } from '@nestjs/common';

import { ChatModule } from './chat/chat.module';
import { CliModule } from './cli/cli.module';
import { CoreModule } from './core/core.module';
import { EventsModule } from './event/event.module';
import { HealthModule } from './health/health.module';
import { WorkspaceModule } from './workspace/workspace.module';

@Module({
  imports: [
    ChatModule,
    CliModule,
    CoreModule,
    EventsModule,
    HealthModule,
    WorkspaceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
