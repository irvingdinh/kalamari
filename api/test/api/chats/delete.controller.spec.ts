import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { ChatEntity } from '../../../src/core/entities/chat.entity';
import { ChatMessageEntity } from '../../../src/core/entities/chat-message.entity';
import { ChatQueueEntity } from '../../../src/core/entities/chat-queue.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('DELETE /api/chats/:id', () => {
  let app: NestApplication;
  let dataSource: DataSource;
  let workspace: WorkspaceEntity;
  let chat: ChatEntity;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await destroyTestApp(app);
  });

  beforeEach(async () => {
    const workspaceRepo = dataSource.getRepository(WorkspaceEntity);
    workspace = workspaceRepo.create({
      id: nanoid(),
      name: 'Test Workspace',
    });
    await workspaceRepo.save(workspace);

    const chatRepo = dataSource.getRepository(ChatEntity);
    chat = chatRepo.create({
      id: nanoid(),
      workspaceId: workspace.id,
      name: 'Test Chat',
    });
    await chatRepo.save(chat);
  });

  afterEach(async () => {
    await dataSource.getRepository(ChatMessageEntity).clear();
    await dataSource.getRepository(ChatQueueEntity).clear();
    await dataSource.getRepository(ChatEntity).clear();
    await dataSource.getRepository(WorkspaceEntity).clear();
  });

  it('should delete the chat and return 204', async () => {
    const res = await axios.delete(withUrl(`/api/chats/${chat.id}`));

    expect(res.status).toBe(204);
  });

  it('should remove the chat from the database', async () => {
    await axios.delete(withUrl(`/api/chats/${chat.id}`));

    const repo = dataSource.getRepository(ChatEntity);
    const deleted = await repo.findOne({ where: { id: chat.id } });

    expect(deleted).toBeNull();
  });

  it('should cascade delete messages', async () => {
    const messageRepo = dataSource.getRepository(ChatMessageEntity);
    const message = messageRepo.create({
      id: nanoid(),
      chatId: chat.id,
      actorType: 'user',
      actorId: null,
      text: 'Hello',
    });
    await messageRepo.save(message);

    await axios.delete(withUrl(`/api/chats/${chat.id}`));

    const deleted = await messageRepo.findOne({ where: { id: message.id } });
    expect(deleted).toBeNull();
  });

  it('should cascade delete queues', async () => {
    const queueRepo = dataSource.getRepository(ChatQueueEntity);
    const queue = queueRepo.create({
      id: nanoid(),
      chatId: chat.id,
      status: 'pending',
    });
    await queueRepo.save(queue);

    await axios.delete(withUrl(`/api/chats/${chat.id}`));

    const deleted = await queueRepo.findOne({ where: { id: queue.id } });
    expect(deleted).toBeNull();
  });

  it('should return 404 for non-existent chat', async () => {
    try {
      await axios.delete(withUrl('/api/chats/nonexistent'));
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });
});
