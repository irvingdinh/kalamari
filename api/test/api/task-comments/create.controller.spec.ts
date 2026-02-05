import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { TaskEntity } from '../../../src/core/entities/task.entity';
import { TaskCommentEntity } from '../../../src/core/entities/task-comment.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { TaskStatus } from '../../../src/task/types';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('POST /api/tasks/:taskId/comments', () => {
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
      description: 'Test task description',
      status: TaskStatus.BACKLOG,
      lastActivityAt: new Date(),
    });
    await taskRepo.save(task);
  });

  afterEach(async () => {
    await dataSource.getRepository(TaskCommentEntity).clear();
    await dataSource.getRepository(TaskEntity).clear();
    await dataSource.getRepository(WorkspaceEntity).clear();
  });

  it('should create a comment with 201 and default actorType to user', async () => {
    const res = await axios.post(withUrl(`/api/tasks/${task.id}/comments`), {
      text: 'A new comment',
    });

    expect(res.status).toBe(201);
    expect(res.data.id).toBeDefined();
    expect(res.data.taskId).toBe(task.id);
    expect(res.data.actorType).toBe('user');
    expect(res.data.actorId).toBeNull();
    expect(res.data.text).toBe('A new comment');
    expect(res.data.createdAt).toBeDefined();
  });

  it('should persist the comment in the database', async () => {
    const res = await axios.post(withUrl(`/api/tasks/${task.id}/comments`), {
      text: 'Persisted comment',
    });

    const repo = dataSource.getRepository(TaskCommentEntity);
    const comment = await repo.findOne({ where: { id: res.data.id } });

    expect(comment).not.toBeNull();
    expect(comment?.text).toBe('Persisted comment');
    expect(comment?.taskId).toBe(task.id);
    expect(comment?.actorType).toBe('user');
    expect(comment?.actorId).toBeNull();
  });

  it('should return 404 for non-existent task', async () => {
    try {
      await axios.post(withUrl('/api/tasks/nonexistent/comments'), {
        text: 'A comment',
      });
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  it('should return 400 when text is missing', async () => {
    try {
      await axios.post(withUrl(`/api/tasks/${task.id}/comments`), {});
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });

  it('should return 400 when text is empty', async () => {
    try {
      await axios.post(withUrl(`/api/tasks/${task.id}/comments`), { text: '' });
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });
});
