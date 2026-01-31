import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { ChatEntity } from '../../../src/core/entities/chat.entity';
import { ChatMessageEntity } from '../../../src/core/entities/chat-message.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('GET /api/chats/:id/messages', () => {
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
    await dataSource.getRepository(ChatEntity).clear();
    await dataSource.getRepository(WorkspaceEntity).clear();
  });

  describe('with no messages', () => {
    it('should return empty data with correct meta structure', async () => {
      const res = await axios.get(withUrl(`/api/chats/${chat.id}/messages`));

      expect(res.status).toBe(200);
      expect(res.data).toEqual({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });
    });

    it('should respect custom page parameter', async () => {
      const res = await axios.get(
        withUrl(`/api/chats/${chat.id}/messages?page=2`),
      );

      expect(res.status).toBe(200);
      expect(res.data.meta.page).toBe(2);
    });

    it('should respect custom limit parameter', async () => {
      const res = await axios.get(
        withUrl(`/api/chats/${chat.id}/messages?limit=5`),
      );

      expect(res.status).toBe(200);
      expect(res.data.meta.limit).toBe(5);
    });
  });

  describe('validation', () => {
    it('should return 404 for non-existent chat', async () => {
      try {
        await axios.get(withUrl('/api/chats/nonexistent/messages'));
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 400 for page less than 1', async () => {
      try {
        await axios.get(withUrl(`/api/chats/${chat.id}/messages?page=0`));
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 for limit greater than 100', async () => {
      try {
        await axios.get(withUrl(`/api/chats/${chat.id}/messages?limit=101`));
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('with messages', () => {
    it('should return created messages', async () => {
      const messageRepo = dataSource.getRepository(ChatMessageEntity);
      const message = messageRepo.create({
        id: nanoid(),
        chatId: chat.id,
        actorType: 'user',
        actorId: null,
        text: 'Hello',
      });
      await messageRepo.save(message);

      const res = await axios.get(withUrl(`/api/chats/${chat.id}/messages`));

      expect(res.status).toBe(200);
      expect(res.data.data).toHaveLength(1);
      expect(res.data.data[0].text).toBe('Hello');
      expect(res.data.data[0].actorType).toBe('user');
      expect(res.data.meta.total).toBe(1);
    });

    it('should paginate correctly', async () => {
      const messageRepo = dataSource.getRepository(ChatMessageEntity);

      for (let i = 1; i <= 5; i++) {
        const message = messageRepo.create({
          id: nanoid(),
          chatId: chat.id,
          actorType: 'user',
          actorId: null,
          text: `Message ${i}`,
        });
        await messageRepo.save(message);
      }

      const res = await axios.get(
        withUrl(`/api/chats/${chat.id}/messages?limit=2`),
      );

      expect(res.status).toBe(200);
      expect(res.data.data).toHaveLength(2);
      expect(res.data.meta.total).toBe(5);
      expect(res.data.meta.totalPages).toBe(3);
    });

    it('should order by createdAt DESC (newest first)', async () => {
      const now = new Date();
      await dataSource
        .createQueryBuilder()
        .insert()
        .into(ChatMessageEntity)
        .values([
          {
            id: nanoid(),
            chatId: chat.id,
            actorType: 'user',
            actorId: null,
            text: 'First',
            createdAt: new Date(now.getTime() - 2000),
          },
          {
            id: nanoid(),
            chatId: chat.id,
            actorType: 'assistant',
            actorId: null,
            text: 'Second',
            createdAt: new Date(now.getTime() - 1000),
          },
          {
            id: nanoid(),
            chatId: chat.id,
            actorType: 'user',
            actorId: null,
            text: 'Third',
            createdAt: now,
          },
        ])
        .execute();

      const res = await axios.get(withUrl(`/api/chats/${chat.id}/messages`));

      expect(res.status).toBe(200);
      expect(res.data.data).toHaveLength(3);
      expect(res.data.data[0].text).toBe('Third');
      expect(res.data.data[1].text).toBe('Second');
      expect(res.data.data[2].text).toBe('First');
    });

    it('should only return messages for the specified chat', async () => {
      const chatRepo = dataSource.getRepository(ChatEntity);
      const otherChat = chatRepo.create({
        id: nanoid(),
        workspaceId: workspace.id,
        name: 'Other Chat',
      });
      await chatRepo.save(otherChat);

      const messageRepo = dataSource.getRepository(ChatMessageEntity);
      await messageRepo.save([
        messageRepo.create({
          id: nanoid(),
          chatId: chat.id,
          actorType: 'user',
          actorId: null,
          text: 'My Message',
        }),
        messageRepo.create({
          id: nanoid(),
          chatId: otherChat.id,
          actorType: 'user',
          actorId: null,
          text: 'Other Message',
        }),
      ]);

      const res = await axios.get(withUrl(`/api/chats/${chat.id}/messages`));

      expect(res.status).toBe(200);
      expect(res.data.data).toHaveLength(1);
      expect(res.data.data[0].text).toBe('My Message');
    });
  });
});
