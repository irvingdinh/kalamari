import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { ChatEntity } from '../../../src/core/entities/chat.entity';
import { ChatQueueEntity } from '../../../src/core/entities/chat-queue.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('POST /api/chats/:id/cancel', () => {
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

  it('should cancel a chat with pending queue and return isProcessing=false', async () => {
    const queueRepo = dataSource.getRepository(ChatQueueEntity);
    const queue = queueRepo.create({
      id: nanoid(),
      chatId: chat.id,
      status: 'pending',
    });
    await queueRepo.save(queue);

    const res = await axios.post(withUrl(`/api/chats/${chat.id}/cancel`));

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(chat.id);
    expect(res.data.isProcessing).toBe(false);

    const updatedQueue = await queueRepo.findOne({ where: { id: queue.id } });
    expect(updatedQueue?.status).toBe('cancelled');
  });

  it('should cancel a chat with in_progress queue and return isProcessing=false', async () => {
    const queueRepo = dataSource.getRepository(ChatQueueEntity);
    const queue = queueRepo.create({
      id: nanoid(),
      chatId: chat.id,
      status: 'in_progress',
    });
    await queueRepo.save(queue);

    const res = await axios.post(withUrl(`/api/chats/${chat.id}/cancel`));

    expect(res.status).toBe(200);
    expect(res.data.isProcessing).toBe(false);

    const updatedQueue = await queueRepo.findOne({ where: { id: queue.id } });
    expect(updatedQueue?.status).toBe('cancelled');
  });

  it('should cancel multiple active queues', async () => {
    const queueRepo = dataSource.getRepository(ChatQueueEntity);
    const queue1 = queueRepo.create({
      id: nanoid(),
      chatId: chat.id,
      status: 'pending',
    });
    const queue2 = queueRepo.create({
      id: nanoid(),
      chatId: chat.id,
      status: 'in_progress',
    });
    await queueRepo.save([queue1, queue2]);

    const res = await axios.post(withUrl(`/api/chats/${chat.id}/cancel`));

    expect(res.status).toBe(200);
    expect(res.data.isProcessing).toBe(false);

    const updatedQueue1 = await queueRepo.findOne({ where: { id: queue1.id } });
    const updatedQueue2 = await queueRepo.findOne({ where: { id: queue2.id } });
    expect(updatedQueue1?.status).toBe('cancelled');
    expect(updatedQueue2?.status).toBe('cancelled');
  });

  it('should return 400 when chat is NOT being processed', async () => {
    try {
      await axios.post(withUrl(`/api/chats/${chat.id}/cancel`));
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe('Chat is not being processed');
    }
  });

  it('should return 400 when all queues are already completed', async () => {
    const queueRepo = dataSource.getRepository(ChatQueueEntity);
    const queue = queueRepo.create({
      id: nanoid(),
      chatId: chat.id,
      status: 'completed',
    });
    await queueRepo.save(queue);

    try {
      await axios.post(withUrl(`/api/chats/${chat.id}/cancel`));
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe('Chat is not being processed');
    }
  });

  it('should return 400 when all queues are already cancelled', async () => {
    const queueRepo = dataSource.getRepository(ChatQueueEntity);
    const queue = queueRepo.create({
      id: nanoid(),
      chatId: chat.id,
      status: 'cancelled',
    });
    await queueRepo.save(queue);

    try {
      await axios.post(withUrl(`/api/chats/${chat.id}/cancel`));
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });

  it('should return 404 for non-existent chat', async () => {
    try {
      await axios.post(withUrl('/api/chats/nonexistent/cancel'));
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });
});
