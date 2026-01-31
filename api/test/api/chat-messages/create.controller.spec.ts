import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { ChatEntity } from '../../../src/core/entities/chat.entity';
import { ChatMessageEntity } from '../../../src/core/entities/chat-message.entity';
import { ChatQueueEntity } from '../../../src/core/entities/chat-queue.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('POST /api/chats/:id/messages', () => {
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
    await dataSource.getRepository(ChatMessageEntity).clear();
    await dataSource.getRepository(ChatEntity).clear();
    await dataSource.getRepository(WorkspaceEntity).clear();
  });

  describe('when chat is NOT processing', () => {
    it('should create a message and return 201', async () => {
      const res = await axios.post(withUrl(`/api/chats/${chat.id}/messages`), {
        text: 'Hello, world!',
      });

      expect(res.status).toBe(201);
      expect(res.data.id).toBeDefined();
      expect(res.data.chatId).toBe(chat.id);
      expect(res.data.text).toBe('Hello, world!');
      expect(res.data.createdAt).toBeDefined();
    });

    it('should default actorType to user and actorId to null', async () => {
      const res = await axios.post(withUrl(`/api/chats/${chat.id}/messages`), {
        text: 'Hello',
      });

      expect(res.status).toBe(201);
      expect(res.data.actorType).toBe('user');
      expect(res.data.actorId).toBeNull();
    });

    it('should create a queue item when message is created', async () => {
      await axios.post(withUrl(`/api/chats/${chat.id}/messages`), {
        text: 'Hello',
      });

      const queueRepo = dataSource.getRepository(ChatQueueEntity);
      const queues = await queueRepo.find({ where: { chatId: chat.id } });

      expect(queues).toHaveLength(1);
      expect(queues[0].status).toBe('pending');
    });

    it('should persist the message in the database', async () => {
      const res = await axios.post(withUrl(`/api/chats/${chat.id}/messages`), {
        text: 'Persisted message',
      });

      const messageRepo = dataSource.getRepository(ChatMessageEntity);
      const message = await messageRepo.findOne({
        where: { id: res.data.id },
      });

      expect(message).not.toBeNull();
      expect(message?.text).toBe('Persisted message');
    });

    it('should generate a unique ID for each message', async () => {
      const res1 = await axios.post(withUrl(`/api/chats/${chat.id}/messages`), {
        text: 'Message 1',
      });

      // Complete the queue created by the first message
      const queueRepo = dataSource.getRepository(ChatQueueEntity);
      await queueRepo.update({ chatId: chat.id }, { status: 'completed' });

      const res2 = await axios.post(withUrl(`/api/chats/${chat.id}/messages`), {
        text: 'Message 2',
      });

      expect(res1.data.id).not.toBe(res2.data.id);
    });

    it('should update chat updatedAt when message is created', async () => {
      const chatRepo = dataSource.getRepository(ChatEntity);
      const chatBefore = await chatRepo.findOne({ where: { id: chat.id } });
      const updatedAtBefore = new Date(chatBefore!.updatedAt).getTime();

      // Small delay to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      await axios.post(withUrl(`/api/chats/${chat.id}/messages`), {
        text: 'Hello',
      });

      const chatAfter = await chatRepo.findOne({ where: { id: chat.id } });
      const updatedAtAfter = new Date(chatAfter!.updatedAt).getTime();

      expect(updatedAtAfter).toBeGreaterThan(updatedAtBefore);
    });
  });

  describe('when chat is processing', () => {
    beforeEach(async () => {
      const queueRepo = dataSource.getRepository(ChatQueueEntity);
      const queue = queueRepo.create({
        id: nanoid(),
        chatId: chat.id,
        status: 'pending',
      });
      await queueRepo.save(queue);
    });

    it('should return 400 when trying to create a message', async () => {
      try {
        await axios.post(withUrl(`/api/chats/${chat.id}/messages`), {
          text: 'Hello',
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe(
          'Chat is currently processing',
        );
      }
    });

    it('should block when queue status is in_progress', async () => {
      const queueRepo = dataSource.getRepository(ChatQueueEntity);
      await queueRepo.update({ chatId: chat.id }, { status: 'in_progress' });

      try {
        await axios.post(withUrl(`/api/chats/${chat.id}/messages`), {
          text: 'Hello',
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe(
          'Chat is currently processing',
        );
      }
    });

    it('should allow messages after queue is completed', async () => {
      const queueRepo = dataSource.getRepository(ChatQueueEntity);
      await queueRepo.update({ chatId: chat.id }, { status: 'completed' });

      const res = await axios.post(withUrl(`/api/chats/${chat.id}/messages`), {
        text: 'Hello after completion',
      });

      expect(res.status).toBe(201);
    });

    it('should allow messages after queue is cancelled', async () => {
      const queueRepo = dataSource.getRepository(ChatQueueEntity);
      await queueRepo.update({ chatId: chat.id }, { status: 'cancelled' });

      const res = await axios.post(withUrl(`/api/chats/${chat.id}/messages`), {
        text: 'Hello after cancellation',
      });

      expect(res.status).toBe(201);
    });
  });

  describe('validation', () => {
    it('should return 404 for non-existent chat', async () => {
      try {
        await axios.post(withUrl('/api/chats/nonexistent/messages'), {
          text: 'Hello',
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 400 when text is missing', async () => {
      try {
        await axios.post(withUrl(`/api/chats/${chat.id}/messages`), {});
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain(
          'text should not be empty',
        );
      }
    });

    it('should return 400 when text is empty string', async () => {
      try {
        await axios.post(withUrl(`/api/chats/${chat.id}/messages`), {
          text: '',
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain(
          'text should not be empty',
        );
      }
    });
  });
});
