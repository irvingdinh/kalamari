import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CliModule } from '../cli/cli.module';
import { CoreModule } from '../core/core.module';
import { WorkspaceEntity } from '../core/entities/workspace.entity';
import { controllers } from './controllers';
import { services } from './services';

@Module({
  imports: [CliModule, CoreModule, TypeOrmModule.forFeature([WorkspaceEntity])],
  controllers: [...controllers],
  providers: [...services],
})
export class WorkspaceModule {}
