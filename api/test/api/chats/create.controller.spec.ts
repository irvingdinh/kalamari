import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { ChatEntity } from '../../../src/core/entities/chat.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('POST /api/workspaces/:id/chats', () => {
  let app: NestApplication;
  let dataSource: DataSource;
  let workspace: WorkspaceEntity;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await destroyTestApp(app);
  });

  beforeEach(async () => {
    const repo = dataSource.getRepository(WorkspaceEntity);
    workspace = repo.create({
      id: nanoid(),
      name: 'Test Workspace',
    });
    await repo.save(workspace);
  });

  afterEach(async () => {
    await dataSource.getRepository(ChatEntity).clear();
    await dataSource.getRepository(WorkspaceEntity).clear();
  });

  it('should create a chat with default name and return 201', async () => {
    const res = await axios.post(
      withUrl(`/api/workspaces/${workspace.id}/chats`),
    );

    expect(res.status).toBe(201);
    expect(res.data.id).toBeDefined();
    expect(res.data.name).toBe('Untitled chat');
    expect(res.data.workspaceId).toBe(workspace.id);
    expect(res.data.isProcessing).toBe(false);
    expect(res.data.createdAt).toBeDefined();
    expect(res.data.updatedAt).toBeDefined();
  });

  it('should persist the chat in the database', async () => {
    const res = await axios.post(
      withUrl(`/api/workspaces/${workspace.id}/chats`),
    );

    const repo = dataSource.getRepository(ChatEntity);
    const chat = await repo.findOne({ where: { id: res.data.id } });

    expect(chat).not.toBeNull();
    expect(chat?.name).toBe('Untitled chat');
    expect(chat?.workspaceId).toBe(workspace.id);
  });

  it('should generate a unique ID for each chat', async () => {
    const res1 = await axios.post(
      withUrl(`/api/workspaces/${workspace.id}/chats`),
    );
    const res2 = await axios.post(
      withUrl(`/api/workspaces/${workspace.id}/chats`),
    );

    expect(res1.data.id).not.toBe(res2.data.id);
  });

  it('should return 404 for non-existent workspace', async () => {
    try {
      await axios.post(withUrl('/api/workspaces/nonexistent/chats'));
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });
});
