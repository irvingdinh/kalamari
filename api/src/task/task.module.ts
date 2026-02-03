import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreModule } from '../core/core.module';
import { TaskEntity } from '../core/entities/task.entity';
import { WorkspaceEntity } from '../core/entities/workspace.entity';
import { controllers } from './controllers';
import { services } from './services';

@Module({
  imports: [
    CoreModule,
    TypeOrmModule.forFeature([TaskEntity, WorkspaceEntity]),
  ],
  controllers: [...controllers],
  providers: [...services],
})
export class TaskModule {}
