import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { entities } from '../entities';
import { DirService } from '../services/dir.service';

export const typeormForRoot = TypeOrmModule.forRootAsync({
  extraProviders: [DirService],
  useFactory: (dirService: DirService): TypeOrmModuleOptions => {
    return {
      type: 'sqlite',
      database: dirService.ensureDatabase(),
      entities: [...entities],
      synchronize: true,
    };
  },
  inject: [DirService],
});

export const typeormForFeature = TypeOrmModule.forFeature([...entities]);
