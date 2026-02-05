import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { TaskEntity } from '../../../src/core/entities/task.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { TaskStatus } from '../../../src/task/types';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('PATCH /api/tasks/:id', () => {
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

  it('should update the summary', async () => {
    const taskRepo = dataSource.getRepository(TaskEntity);
    const task = taskRepo.create({
      id: nanoid(),
      workspaceId: workspace.id,
      summary: 'Original Summary',
      description: 'Original description',
      status: TaskStatus.BACKLOG,
      lastActivityAt: new Date(),
    });
    await taskRepo.save(task);

    const res = await axios.patch(withUrl(`/api/tasks/${task.id}`), {
      summary: 'Updated Summary',
    });

    expect(res.status).toBe(200);
    expect(res.data.summary).toBe('Updated Summary');
  });

  it('should update the status', async () => {
    const taskRepo = dataSource.getRepository(TaskEntity);
    const task = taskRepo.create({
      id: nanoid(),
      workspaceId: workspace.id,
      summary: 'Task',
      description: 'Task description',
      status: TaskStatus.BACKLOG,
      lastActivityAt: new Date(),
    });
    await taskRepo.save(task);

    const res = await axios.patch(withUrl(`/api/tasks/${task.id}`), {
      status: 'in_progress',
    });

    expect(res.status).toBe(200);
    expect(res.data.status).toBe('in_progress');
  });

  it('should update the description', async () => {
    const taskRepo = dataSource.getRepository(TaskEntity);
    const task = taskRepo.create({
      id: nanoid(),
      workspaceId: workspace.id,
      summary: 'Task',
      description: 'Original description',
      status: TaskStatus.BACKLOG,
      lastActivityAt: new Date(),
    });
    await taskRepo.save(task);

    const res = await axios.patch(withUrl(`/api/tasks/${task.id}`), {
      description: 'New description',
    });

    expect(res.status).toBe(200);
    expect(res.data.description).toBe('New description');
  });

  it('should auto-update lastActivityAt when fields change', async () => {
    const taskRepo = dataSource.getRepository(TaskEntity);
    const pastDate = new Date('2020-01-01T00:00:00.000Z');
    const task = taskRepo.create({
      id: nanoid(),
      workspaceId: workspace.id,
      summary: 'Task',
      description: 'Task description',
      status: TaskStatus.BACKLOG,
      lastActivityAt: pastDate,
    });
    await taskRepo.save(task);

    const res = await axios.patch(withUrl(`/api/tasks/${task.id}`), {
      summary: 'Updated',
    });

    expect(res.status).toBe(200);
    expect(
      new Date(res.data.lastActivityAt as string).getTime(),
    ).toBeGreaterThan(pastDate.getTime());
  });

  it('should not bump lastActivityAt when no fields change', async () => {
    const taskRepo = dataSource.getRepository(TaskEntity);
    const pastDate = new Date('2020-01-01T00:00:00.000Z');
    const task = taskRepo.create({
      id: nanoid(),
      workspaceId: workspace.id,
      summary: 'Task',
      description: 'Task description',
      status: TaskStatus.BACKLOG,
      lastActivityAt: pastDate,
    });
    await taskRepo.save(task);

    const res = await axios.patch(withUrl(`/api/tasks/${task.id}`), {});

    expect(res.status).toBe(200);
    expect(new Date(res.data.lastActivityAt as string).getTime()).toBe(
      pastDate.getTime(),
    );
  });

  it('should not bump lastActivityAt when values are identical', async () => {
    const taskRepo = dataSource.getRepository(TaskEntity);
    const pastDate = new Date('2020-01-01T00:00:00.000Z');
    const task = taskRepo.create({
      id: nanoid(),
      workspaceId: workspace.id,
      summary: 'Same Summary',
      description: 'Same description',
      status: TaskStatus.BACKLOG,
      lastActivityAt: pastDate,
    });
    await taskRepo.save(task);

    const res = await axios.patch(withUrl(`/api/tasks/${task.id}`), {
      summary: 'Same Summary',
      status: TaskStatus.BACKLOG,
    });

    expect(res.status).toBe(200);
    expect(new Date(res.data.lastActivityAt as string).getTime()).toBe(
      pastDate.getTime(),
    );
  });

  it('should return 404 for non-existent task', async () => {
    try {
      await axios.patch(withUrl('/api/tasks/nonexistent'), {
        summary: 'Updated',
      });
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  it('should return 400 for invalid status', async () => {
    const taskRepo = dataSource.getRepository(TaskEntity);
    const task = taskRepo.create({
      id: nanoid(),
      workspaceId: workspace.id,
      summary: 'Task',
      description: 'Task description',
      status: TaskStatus.BACKLOG,
      lastActivityAt: new Date(),
    });
    await taskRepo.save(task);

    try {
      await axios.patch(withUrl(`/api/tasks/${task.id}`), {
        status: 'invalid_status',
      });
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });
});
