import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { TaskEntity } from '../../../src/core/entities/task.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('GET /api/tasks', () => {
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
    await dataSource.getRepository(TaskEntity).clear();
    await dataSource.getRepository(WorkspaceEntity).clear();
  });

  describe('without filters', () => {
    it('should return empty data with correct meta structure when no tasks exist', async () => {
      const res = await axios.get(withUrl('/api/tasks'));

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

    it('should return all tasks across all workspaces', async () => {
      const workspaceRepo = dataSource.getRepository(WorkspaceEntity);
      const otherWorkspace = workspaceRepo.create({
        id: nanoid(),
        name: 'Other Workspace',
      });
      await workspaceRepo.save(otherWorkspace);

      const taskRepo = dataSource.getRepository(TaskEntity);
      await taskRepo.save([
        taskRepo.create({
          id: nanoid(),
          workspaceId: workspace.id,
          summary: 'Task 1',
          description: 'Desc 1',
          lastActivityAt: new Date(),
        }),
        taskRepo.create({
          id: nanoid(),
          workspaceId: otherWorkspace.id,
          summary: 'Task 2',
          description: 'Desc 2',
          lastActivityAt: new Date(),
        }),
      ]);

      const res = await axios.get(withUrl('/api/tasks'));

      expect(res.status).toBe(200);
      expect(res.data.data).toHaveLength(2);
      expect(res.data.meta.total).toBe(2);
    });

    it('should paginate correctly', async () => {
      const taskRepo = dataSource.getRepository(TaskEntity);

      for (let i = 1; i <= 5; i++) {
        await taskRepo.save(
          taskRepo.create({
            id: nanoid(),
            workspaceId: workspace.id,
            summary: `Task ${i}`,
            description: `Desc ${i}`,
            lastActivityAt: new Date(),
          }),
        );
      }

      const res = await axios.get(withUrl('/api/tasks?limit=2'));

      expect(res.status).toBe(200);
      expect(res.data.data).toHaveLength(2);
      expect(res.data.meta.total).toBe(5);
      expect(res.data.meta.totalPages).toBe(3);
    });
  });

  describe('with workspace_id filter', () => {
    it('should only return tasks for the specified workspace', async () => {
      const workspaceRepo = dataSource.getRepository(WorkspaceEntity);
      const otherWorkspace = workspaceRepo.create({
        id: nanoid(),
        name: 'Other Workspace',
      });
      await workspaceRepo.save(otherWorkspace);

      const taskRepo = dataSource.getRepository(TaskEntity);
      await taskRepo.save([
        taskRepo.create({
          id: nanoid(),
          workspaceId: workspace.id,
          summary: 'My Task',
          description: 'Desc',
          lastActivityAt: new Date(),
        }),
        taskRepo.create({
          id: nanoid(),
          workspaceId: otherWorkspace.id,
          summary: 'Other Task',
          description: 'Desc',
          lastActivityAt: new Date(),
        }),
      ]);

      const res = await axios.get(
        withUrl(`/api/tasks?workspace_id=${workspace.id}`),
      );

      expect(res.status).toBe(200);
      expect(res.data.data).toHaveLength(1);
      expect(res.data.data[0].summary).toBe('My Task');
    });

    it('should return empty result for non-existent workspace', async () => {
      const res = await axios.get(
        withUrl('/api/tasks?workspace_id=nonexistent'),
      );

      expect(res.status).toBe(200);
      expect(res.data.data).toEqual([]);
      expect(res.data.meta.total).toBe(0);
    });
  });

  describe('with status filter', () => {
    it('should only return tasks with matching status', async () => {
      const taskRepo = dataSource.getRepository(TaskEntity);
      await taskRepo.save([
        taskRepo.create({
          id: nanoid(),
          workspaceId: workspace.id,
          summary: 'Todo Task',
          description: 'Desc',
          status: 'todo',
          lastActivityAt: new Date(),
        }),
        taskRepo.create({
          id: nanoid(),
          workspaceId: workspace.id,
          summary: 'Done Task',
          description: 'Desc',
          status: 'done',
          lastActivityAt: new Date(),
        }),
      ]);

      const res = await axios.get(withUrl('/api/tasks?status=todo'));

      expect(res.status).toBe(200);
      expect(res.data.data).toHaveLength(1);
      expect(res.data.data[0].summary).toBe('Todo Task');
    });
  });

  describe('ordering', () => {
    it('should order by lastActivityAt DESC (most recent first)', async () => {
      const now = new Date();
      await dataSource
        .createQueryBuilder()
        .insert()
        .into(TaskEntity)
        .values([
          {
            id: nanoid(),
            workspaceId: workspace.id,
            summary: 'First',
            description: 'Desc',
            lastActivityAt: new Date(now.getTime() - 2000),
            createdAt: new Date(now.getTime() - 2000),
            updatedAt: new Date(now.getTime() - 2000),
          },
          {
            id: nanoid(),
            workspaceId: workspace.id,
            summary: 'Second',
            description: 'Desc',
            lastActivityAt: new Date(now.getTime() - 1000),
            createdAt: new Date(now.getTime() - 1000),
            updatedAt: new Date(now.getTime() - 1000),
          },
          {
            id: nanoid(),
            workspaceId: workspace.id,
            summary: 'Third',
            description: 'Desc',
            lastActivityAt: now,
            createdAt: now,
            updatedAt: now,
          },
        ])
        .execute();

      const res = await axios.get(withUrl('/api/tasks'));

      expect(res.status).toBe(200);
      expect(res.data.data).toHaveLength(3);
      expect(res.data.data[0].summary).toBe('Third');
      expect(res.data.data[1].summary).toBe('Second');
      expect(res.data.data[2].summary).toBe('First');
    });
  });

  describe('validation', () => {
    it('should return 400 for page less than 1', async () => {
      try {
        await axios.get(withUrl('/api/tasks?page=0'));
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 for invalid status', async () => {
      try {
        await axios.get(withUrl('/api/tasks?status=invalid'));
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 for limit greater than 100', async () => {
      try {
        await axios.get(withUrl('/api/tasks?limit=101'));
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });
});
