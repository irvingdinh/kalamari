#!/usr/bin/env node

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AppConfig } from './core/config/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService).get<AppConfig>('root')!;
  await app.listen(config.http.port, config.http.host);
}

void bootstrap();
