import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { ChatEntity } from '../../../src/core/entities/chat.entity';
import { ChatQueueEntity } from '../../../src/core/entities/chat-queue.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('GET /api/chats/:id', () => {
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
    await dataSource.getRepository(ChatQueueEntity).clear();
    await dataSource.getRepository(ChatEntity).clear();
    await dataSource.getRepository(WorkspaceEntity).clear();
  });

  it('should return the chat with isProcessing=false when no active queues', async () => {
    const res = await axios.get(withUrl(`/api/chats/${chat.id}`));

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(chat.id);
    expect(res.data.name).toBe('Test Chat');
    expect(res.data.workspaceId).toBe(workspace.id);
    expect(res.data.isProcessing).toBe(false);
    expect(res.data.createdAt).toBeDefined();
    expect(res.data.updatedAt).toBeDefined();
  });

  it('should return isProcessing=true when chat has pending queue', async () => {
    const queueRepo = dataSource.getRepository(ChatQueueEntity);
    const queue = queueRepo.create({
      id: nanoid(),
      chatId: chat.id,
      status: 'pending',
    });
    await queueRepo.save(queue);

    const res = await axios.get(withUrl(`/api/chats/${chat.id}`));

    expect(res.status).toBe(200);
    expect(res.data.isProcessing).toBe(true);
  });

  it('should return isProcessing=true when chat has in_progress queue', async () => {
    const queueRepo = dataSource.getRepository(ChatQueueEntity);
    const queue = queueRepo.create({
      id: nanoid(),
      chatId: chat.id,
      status: 'in_progress',
    });
    await queueRepo.save(queue);

    const res = await axios.get(withUrl(`/api/chats/${chat.id}`));

    expect(res.status).toBe(200);
    expect(res.data.isProcessing).toBe(true);
  });

  it('should return isProcessing=false when all queues are completed', async () => {
    const queueRepo = dataSource.getRepository(ChatQueueEntity);
    const queue = queueRepo.create({
      id: nanoid(),
      chatId: chat.id,
      status: 'completed',
    });
    await queueRepo.save(queue);

    const res = await axios.get(withUrl(`/api/chats/${chat.id}`));

    expect(res.status).toBe(200);
    expect(res.data.isProcessing).toBe(false);
  });

  it('should return 404 for non-existent chat', async () => {
    try {
      await axios.get(withUrl('/api/chats/nonexistent'));
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });
});
