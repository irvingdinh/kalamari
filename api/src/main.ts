#!/usr/bin/env node

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { AppConfig } from './core/config/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService).get<AppConfig>('root')!;
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Kalamari API')
    .setDescription(
      'AI chat capabilities API with workspace and chat management',
    )
    .setVersion('0.0.1')
    .addTag('workspaces', 'Workspace management operations')
    .addTag('chats', 'Chat session operations')
    .addTag('messages', 'Chat message operations')
    .addTag('health', 'Health check endpoint')
    .addTag('sse', 'Server-sent events for real-time updates')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(config.http.port, config.http.host);
}

void bootstrap();
