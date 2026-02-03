import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { TaskEntity } from '../../../src/core/entities/task.entity';
import { TaskCommentEntity } from '../../../src/core/entities/task-comment.entity';
import { TaskQueueEntity } from '../../../src/core/entities/task-queue.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('DELETE /api/tasks/:id', () => {
  let app: NestApplication;
  let dataSource: DataSource;
  let workspace: WorkspaceEntity;
  let task: TaskEntity;

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

    const taskRepo = dataSource.getRepository(TaskEntity);
    task = taskRepo.create({
      id: nanoid(),
      workspaceId: workspace.id,
      summary: 'Test Task',
      description: 'Test description',
      lastActivityAt: new Date(),
    });
    await taskRepo.save(task);
  });

  afterEach(async () => {
    await dataSource.getRepository(TaskCommentEntity).clear();
    await dataSource.getRepository(TaskQueueEntity).clear();
    await dataSource.getRepository(TaskEntity).clear();
    await dataSource.getRepository(WorkspaceEntity).clear();
  });

  it('should delete the task and return 204', async () => {
    const res = await axios.delete(withUrl(`/api/tasks/${task.id}`));

    expect(res.status).toBe(204);
  });

  it('should remove the task from the database', async () => {
    await axios.delete(withUrl(`/api/tasks/${task.id}`));

    const repo = dataSource.getRepository(TaskEntity);
    const deleted = await repo.findOne({ where: { id: task.id } });

    expect(deleted).toBeNull();
  });

  it('should cascade delete comments', async () => {
    const commentRepo = dataSource.getRepository(TaskCommentEntity);
    const comment = commentRepo.create({
      id: nanoid(),
      taskId: task.id,
      actorType: 'user',
      actorId: null,
      text: 'Hello',
    });
    await commentRepo.save(comment);

    await axios.delete(withUrl(`/api/tasks/${task.id}`));

    const deleted = await commentRepo.findOne({ where: { id: comment.id } });
    expect(deleted).toBeNull();
  });

  it('should cascade delete queues', async () => {
    const queueRepo = dataSource.getRepository(TaskQueueEntity);
    const queue = queueRepo.create({
      id: nanoid(),
      taskId: task.id,
      status: 'pending',
    });
    await queueRepo.save(queue);

    await axios.delete(withUrl(`/api/tasks/${task.id}`));

    const deleted = await queueRepo.findOne({ where: { id: queue.id } });
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
});
