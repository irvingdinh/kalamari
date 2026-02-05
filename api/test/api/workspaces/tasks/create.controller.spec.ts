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

  it('should create a task with defaults and return 201', async () => {
    const res = await axios.post(
      withUrl(`/api/workspaces/${workspace.id}/tasks`),
      { summary: 'New Task', description: 'New task description' },
    );

    expect(res.status).toBe(201);
    expect(res.data.id).toBeDefined();
    expect(res.data.summary).toBe('New Task');
    expect(res.data.description).toBe('New task description');
    expect(res.data.status).toBe('backlog');
    expect(res.data.workspaceId).toBe(workspace.id);
    expect(res.data.lastActivityAt).toBeDefined();
    expect(res.data.createdAt).toBeDefined();
    expect(res.data.updatedAt).toBeDefined();
  });

  it('should create a task with all fields', async () => {
    const res = await axios.post(
      withUrl(`/api/workspaces/${workspace.id}/tasks`),
      {
        summary: 'Full Task',
        description: 'A detailed description',
        status: 'in_progress',
      },
    );

    expect(res.status).toBe(201);
    expect(res.data.summary).toBe('Full Task');
    expect(res.data.description).toBe('A detailed description');
    expect(res.data.status).toBe('in_progress');
  });

  it('should persist the task in the database', async () => {
    const res = await axios.post(
      withUrl(`/api/workspaces/${workspace.id}/tasks`),
      { summary: 'Persisted Task', description: 'Persisted task description' },
    );

    const repo = dataSource.getRepository(TaskEntity);
    const task = await repo.findOne({ where: { id: res.data.id } });

    expect(task).not.toBeNull();
    expect(task?.summary).toBe('Persisted Task');
    expect(task?.workspaceId).toBe(workspace.id);
  });

  it('should generate a unique ID for each task', async () => {
    const res1 = await axios.post(
      withUrl(`/api/workspaces/${workspace.id}/tasks`),
      { summary: 'Task 1', description: 'Description 1' },
    );
    const res2 = await axios.post(
      withUrl(`/api/workspaces/${workspace.id}/tasks`),
      { summary: 'Task 2', description: 'Description 2' },
    );

    expect(res1.data.id).not.toBe(res2.data.id);
  });

  it('should return 404 for non-existent workspace', async () => {
    try {
      await axios.post(withUrl('/api/workspaces/nonexistent/tasks'), {
        summary: 'Task',
        description: 'Task description',
      });
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  it('should return 400 when summary is missing', async () => {
    try {
      await axios.post(withUrl(`/api/workspaces/${workspace.id}/tasks`), {
        description: 'Task description',
      });
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });

  it('should return 400 when description is missing', async () => {
    try {
      await axios.post(withUrl(`/api/workspaces/${workspace.id}/tasks`), {
        summary: 'Task without description',
      });
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });

  it('should return 400 for invalid status', async () => {
    try {
      await axios.post(withUrl(`/api/workspaces/${workspace.id}/tasks`), {
        summary: 'Task',
        description: 'Task description',
        status: 'invalid',
      });
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });
});
