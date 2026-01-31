import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { ChatEntity } from '../../../src/core/entities/chat.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('PATCH /api/chats/:id', () => {
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
      name: 'Original Name',
    });
    await chatRepo.save(chat);
  });

  afterEach(async () => {
    await dataSource.getRepository(ChatEntity).clear();
    await dataSource.getRepository(WorkspaceEntity).clear();
  });

  it('should update the chat name', async () => {
    const res = await axios.patch(withUrl(`/api/chats/${chat.id}`), {
      name: 'Updated Name',
    });

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(chat.id);
    expect(res.data.name).toBe('Updated Name');
    expect(res.data.isProcessing).toBe(false);
  });

  it('should persist the updated name in the database', async () => {
    await axios.patch(withUrl(`/api/chats/${chat.id}`), {
      name: 'Persisted Name',
    });

    const repo = dataSource.getRepository(ChatEntity);
    const updated = await repo.findOne({ where: { id: chat.id } });

    expect(updated?.name).toBe('Persisted Name');
  });

  it('should not change name when not provided', async () => {
    const res = await axios.patch(withUrl(`/api/chats/${chat.id}`), {});

    expect(res.status).toBe(200);
    expect(res.data.name).toBe('Original Name');
  });

  it('should return 404 for non-existent chat', async () => {
    try {
      await axios.patch(withUrl('/api/chats/nonexistent'), {
        name: 'New Name',
      });
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  describe('validation', () => {
    it('should return 400 when name exceeds 255 characters', async () => {
      try {
        await axios.patch(withUrl(`/api/chats/${chat.id}`), {
          name: 'a'.repeat(256),
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain(
          'name must be shorter than or equal to 255 characters',
        );
      }
    });

    it('should accept name with exactly 255 characters', async () => {
      const res = await axios.patch(withUrl(`/api/chats/${chat.id}`), {
        name: 'a'.repeat(255),
      });

      expect(res.status).toBe(200);
      expect(res.data.name).toBe('a'.repeat(255));
    });

    it('should return 400 when name is not a string', async () => {
      try {
        await axios.patch(withUrl(`/api/chats/${chat.id}`), {
          name: 123,
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('name must be a string');
      }
    });
  });
});
