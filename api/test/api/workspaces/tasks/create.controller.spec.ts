import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { TaskEntity } from '../../../../src/core/entities/task.entity';
import { WorkspaceEntity } from '../../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../../utils';

describe('POST /api/workspaces/:workspaceId/tasks', () => {
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

  it('should create a task and return 201', async () => {
    const res = await axios.post(
      withUrl(`/api/workspaces/${workspace.id}/tasks`),
      {
        summary: 'New Task',
        description: 'Task description',
      },
    );

    expect(res.status).toBe(201);
    expect(res.data.id).toBeDefined();
    expect(res.data.workspaceId).toBe(workspace.id);
    expect(res.data.summary).toBe('New Task');
    expect(res.data.description).toBe('Task description');
    expect(res.data.status).toBe('todo');
    expect(res.data.lastActivityAt).toBeDefined();
    expect(res.data.createdAt).toBeDefined();
    expect(res.data.updatedAt).toBeDefined();
  });

  it('should persist the task in the database', async () => {
    const res = await axios.post(
      withUrl(`/api/workspaces/${workspace.id}/tasks`),
      {
        summary: 'Persisted Task',
        description: 'Persisted description',
      },
    );

    const repo = dataSource.getRepository(TaskEntity);
    const task = await repo.findOne({ where: { id: res.data.id } });

    expect(task).not.toBeNull();
    expect(task?.summary).toBe('Persisted Task');
    expect(task?.description).toBe('Persisted description');
  });

  it('should return 404 for non-existent workspace', async () => {
    try {
      await axios.post(withUrl('/api/workspaces/nonexistent/tasks'), {
        summary: 'Task',
        description: 'Desc',
      });
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  describe('validation', () => {
    it('should return 400 when summary is missing', async () => {
      try {
        await axios.post(withUrl(`/api/workspaces/${workspace.id}/tasks`), {
          description: 'Desc',
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 when description is missing', async () => {
      try {
        await axios.post(withUrl(`/api/workspaces/${workspace.id}/tasks`), {
          summary: 'Task',
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 when summary exceeds 255 characters', async () => {
      try {
        await axios.post(withUrl(`/api/workspaces/${workspace.id}/tasks`), {
          summary: 'a'.repeat(256),
          description: 'Desc',
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain(
          'summary must be shorter than or equal to 255 characters',
        );
      }
    });
  });
});
