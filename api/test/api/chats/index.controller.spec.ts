import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { ChatEntity } from '../../../src/core/entities/chat.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('GET /api/chats', () => {
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

  describe('without workspace_id filter', () => {
    it('should return empty data with correct meta structure when no chats exist', async () => {
      const res = await axios.get(withUrl('/api/chats'));

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

    it('should return all chats across all workspaces', async () => {
      const workspaceRepo = dataSource.getRepository(WorkspaceEntity);
      const otherWorkspace = workspaceRepo.create({
        id: nanoid(),
        name: 'Other Workspace',
      });
      await workspaceRepo.save(otherWorkspace);

      const chatRepo = dataSource.getRepository(ChatEntity);
      await chatRepo.save([
        chatRepo.create({
          id: nanoid(),
          workspaceId: workspace.id,
          name: 'Chat 1',
        }),
        chatRepo.create({
          id: nanoid(),
          workspaceId: otherWorkspace.id,
          name: 'Chat 2',
        }),
      ]);

      const res = await axios.get(withUrl('/api/chats'));

      expect(res.status).toBe(200);
      expect(res.data.data).toHaveLength(2);
      expect(res.data.meta.total).toBe(2);
    });

    it('should paginate correctly across all workspaces', async () => {
      const chatRepo = dataSource.getRepository(ChatEntity);

      for (let i = 1; i <= 5; i++) {
        await chatRepo.save(
          chatRepo.create({
            id: nanoid(),
            workspaceId: workspace.id,
            name: `Chat ${i}`,
          }),
        );
      }

      const res = await axios.get(withUrl('/api/chats?limit=2'));

      expect(res.status).toBe(200);
      expect(res.data.data).toHaveLength(2);
      expect(res.data.meta.total).toBe(5);
      expect(res.data.meta.totalPages).toBe(3);
    });
  });

  describe('with workspace_id filter', () => {
    describe('with no chats', () => {
      it('should return empty data with correct meta structure', async () => {
        const res = await axios.get(
          withUrl(`/api/chats?workspace_id=${workspace.id}`),
        );

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
          withUrl(`/api/chats?workspace_id=${workspace.id}&page=2`),
        );

        expect(res.status).toBe(200);
        expect(res.data.meta.page).toBe(2);
      });

      it('should respect custom limit parameter', async () => {
        const res = await axios.get(
          withUrl(`/api/chats?workspace_id=${workspace.id}&limit=5`),
        );

        expect(res.status).toBe(200);
        expect(res.data.meta.limit).toBe(5);
      });

      it('should return empty result for non-existent workspace', async () => {
        const res = await axios.get(
          withUrl('/api/chats?workspace_id=nonexistent'),
        );

        expect(res.status).toBe(200);
        expect(res.data.data).toEqual([]);
        expect(res.data.meta.total).toBe(0);
      });
    });

    describe('with chats', () => {
      it('should return created chats with isProcessing field', async () => {
        const chatRepo = dataSource.getRepository(ChatEntity);
        const chat = chatRepo.create({
          id: nanoid(),
          workspaceId: workspace.id,
          name: 'Test Chat',
        });
        await chatRepo.save(chat);

        const res = await axios.get(
          withUrl(`/api/chats?workspace_id=${workspace.id}`),
        );

        expect(res.status).toBe(200);
        expect(res.data.data).toHaveLength(1);
        expect(res.data.data[0].name).toBe('Test Chat');
        expect(res.data.data[0].isProcessing).toBe(false);
        expect(res.data.meta.total).toBe(1);
      });

      it('should paginate correctly', async () => {
        const chatRepo = dataSource.getRepository(ChatEntity);

        for (let i = 1; i <= 5; i++) {
          const chat = chatRepo.create({
            id: nanoid(),
            workspaceId: workspace.id,
            name: `Chat ${i}`,
          });
          await chatRepo.save(chat);
        }

        const res = await axios.get(
          withUrl(`/api/chats?workspace_id=${workspace.id}&limit=2`),
        );

        expect(res.status).toBe(200);
        expect(res.data.data).toHaveLength(2);
        expect(res.data.meta.total).toBe(5);
        expect(res.data.meta.totalPages).toBe(3);
      });

      it('should order by updatedAt DESC (most recently updated first)', async () => {
        const now = new Date();
        await dataSource
          .createQueryBuilder()
          .insert()
          .into(ChatEntity)
          .values([
            {
              id: nanoid(),
              workspaceId: workspace.id,
              name: 'First',
              createdAt: new Date(now.getTime() - 2000),
              updatedAt: new Date(now.getTime() - 2000),
            },
            {
              id: nanoid(),
              workspaceId: workspace.id,
              name: 'Second',
              createdAt: new Date(now.getTime() - 1000),
              updatedAt: new Date(now.getTime() - 1000),
            },
            {
              id: nanoid(),
              workspaceId: workspace.id,
              name: 'Third',
              createdAt: now,
              updatedAt: now,
            },
          ])
          .execute();

        const res = await axios.get(
          withUrl(`/api/chats?workspace_id=${workspace.id}`),
        );

        expect(res.status).toBe(200);
        expect(res.data.data).toHaveLength(3);
        expect(res.data.data[0].name).toBe('Third');
        expect(res.data.data[1].name).toBe('Second');
        expect(res.data.data[2].name).toBe('First');
      });

      it('should only return chats for the specified workspace', async () => {
        const workspaceRepo = dataSource.getRepository(WorkspaceEntity);
        const otherWorkspace = workspaceRepo.create({
          id: nanoid(),
          name: 'Other Workspace',
        });
        await workspaceRepo.save(otherWorkspace);

        const chatRepo = dataSource.getRepository(ChatEntity);
        await chatRepo.save([
          chatRepo.create({
            id: nanoid(),
            workspaceId: workspace.id,
            name: 'My Chat',
          }),
          chatRepo.create({
            id: nanoid(),
            workspaceId: otherWorkspace.id,
            name: 'Other Chat',
          }),
        ]);

        const res = await axios.get(
          withUrl(`/api/chats?workspace_id=${workspace.id}`),
        );

        expect(res.status).toBe(200);
        expect(res.data.data).toHaveLength(1);
        expect(res.data.data[0].name).toBe('My Chat');
      });
    });
  });

  describe('validation', () => {
    it('should return 400 for page less than 1', async () => {
      try {
        await axios.get(withUrl('/api/chats?page=0'));
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 for limit greater than 100', async () => {
      try {
        await axios.get(withUrl('/api/chats?limit=101'));
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });
});
