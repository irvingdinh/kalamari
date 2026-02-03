import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CliModule } from '../cli/cli.module';
import { CoreModule } from '../core/core.module';
import { AgentEntity } from '../core/entities/agent.entity';
import { TaskEntity } from '../core/entities/task.entity';
import { TaskCommentEntity } from '../core/entities/task-comment.entity';
import { WorkspaceEntity } from '../core/entities/workspace.entity';
import { TemplateModule } from '../template/template.module';
import { taskAgentActions } from './agent-actions';
import { controllers } from './controllers';
import { processors } from './processors';
import { services } from './services';

@Module({
  imports: [
    CoreModule,
    CliModule,
    TemplateModule,
    TypeOrmModule.forFeature([
      AgentEntity,
      TaskCommentEntity,
      TaskEntity,
      WorkspaceEntity,
    ]),
  ],
  controllers: [...controllers],
  providers: [...taskAgentActions, ...processors, ...services],
})
export class TaskModule {}
