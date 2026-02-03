import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { TaskEntity } from '../../../src/core/entities/task.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { TaskStatus } from '../../../src/task/types';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('DELETE /api/tasks/:id', () => {
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

  it('should delete the task and return 204', async () => {
    const taskRepo = dataSource.getRepository(TaskEntity);
    const task = taskRepo.create({
      id: nanoid(),
      workspaceId: workspace.id,
      summary: 'Task to delete',
      status: TaskStatus.BACKLOG,
      lastActivityAt: new Date(),
    });
    await taskRepo.save(task);

    const res = await axios.delete(withUrl(`/api/tasks/${task.id}`));

    expect(res.status).toBe(204);

    const deleted = await taskRepo.findOne({ where: { id: task.id } });
    expect(deleted).toBeNull();
  });

  it('should return 404 for non-existent task', async () => {
    try {
      await axios.delete(withUrl('/api/tasks/nonexistent'));
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  it('should cascade delete tasks when workspace is deleted', async () => {
    const taskRepo = dataSource.getRepository(TaskEntity);
    const task = taskRepo.create({
      id: nanoid(),
      workspaceId: workspace.id,
      summary: 'Cascaded Task',
      status: TaskStatus.BACKLOG,
      lastActivityAt: new Date(),
    });
    await taskRepo.save(task);

    await axios.delete(withUrl(`/api/workspaces/${workspace.id}`));

    const deleted = await taskRepo.findOne({ where: { id: task.id } });
    expect(deleted).toBeNull();
  });
});
