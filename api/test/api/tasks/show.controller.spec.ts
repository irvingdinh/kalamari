import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { TaskEntity } from '../../../src/core/entities/task.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('GET /api/tasks/:id', () => {
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

  it('should return the task when it exists', async () => {
    const taskRepo = dataSource.getRepository(TaskEntity);
    const task = taskRepo.create({
      id: nanoid(),
      workspaceId: workspace.id,
      summary: 'Test Task',
      description: 'A test description',
      status: 'backlog',
      lastActivityAt: new Date(),
    });
    await taskRepo.save(task);

    const res = await axios.get(withUrl(`/api/tasks/${task.id}`));

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(task.id);
    expect(res.data.summary).toBe('Test Task');
    expect(res.data.description).toBe('A test description');
    expect(res.data.status).toBe('backlog');
    expect(res.data.workspaceId).toBe(workspace.id);
    expect(res.data.lastActivityAt).toBeDefined();
    expect(res.data.createdAt).toBeDefined();
    expect(res.data.updatedAt).toBeDefined();
  });

  it('should return 404 for non-existent task', async () => {
    try {
      await axios.get(withUrl('/api/tasks/nonexistent'));
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });
});
