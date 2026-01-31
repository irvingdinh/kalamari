import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreModule } from '../core/core.module';
import { ChatEntity } from '../core/entities/chat.entity';
import { ChatMessageEntity } from '../core/entities/chat-message.entity';
import { ChatQueueEntity } from '../core/entities/chat-queue.entity';
import { WorkspaceEntity } from '../core/entities/workspace.entity';
import { controllers } from './controllers';
import { services } from './services';

@Module({
  imports: [
    CoreModule,
    TypeOrmModule.forFeature([
      ChatEntity,
      ChatMessageEntity,
      ChatQueueEntity,
      WorkspaceEntity,
    ]),
  ],
  controllers: [...controllers],
  providers: [...services],
})
export class ChatModule {}
