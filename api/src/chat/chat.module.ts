import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CliModule } from '../cli/cli.module';
import { CoreModule } from '../core/core.module';
import { ChatEntity } from '../core/entities/chat.entity';
import { ChatMessageEntity } from '../core/entities/chat-message.entity';
import { ChatQueueEntity } from '../core/entities/chat-queue.entity';
import { WorkspaceEntity } from '../core/entities/workspace.entity';
import { TemplateModule } from '../template/template.module';
import { agentActions } from './agent-actions';
import { controllers } from './controllers';
import { processors } from './processors';
import { services } from './services';

@Module({
  imports: [
    CoreModule,
    CliModule,
    TemplateModule,
    TypeOrmModule.forFeature([
      ChatEntity,
      ChatMessageEntity,
      ChatQueueEntity,
      WorkspaceEntity,
    ]),
  ],
  controllers: [...controllers],
  providers: [...agentActions, ...processors, ...services],
})
export class ChatModule {}
