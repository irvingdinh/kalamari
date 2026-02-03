import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { TaskEntity } from '../../../src/core/entities/task.entity';
import { TaskCommentEntity } from '../../../src/core/entities/task-comment.entity';
import { TaskQueueEntity } from '../../../src/core/entities/task-queue.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
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
      description: 'Test description',
      lastActivityAt: new Date(),
    });
    await taskRepo.save(task);
  });

  afterEach(async () => {
    await dataSource.getRepository(TaskQueueEntity).clear();
    await dataSource.getRepository(TaskCommentEntity).clear();
    await dataSource.getRepository(TaskEntity).clear();
    await dataSource.getRepository(WorkspaceEntity).clear();
  });

  it('should create a comment and return 201', async () => {
    const res = await axios.post(withUrl(`/api/tasks/${task.id}/comments`), {
      text: 'My comment',
    });

    expect(res.status).toBe(201);
    expect(res.data.id).toBeDefined();
    expect(res.data.taskId).toBe(task.id);
    expect(res.data.actorType).toBe('user');
    expect(res.data.actorId).toBeNull();
    expect(res.data.text).toBe('My comment');
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
  });

  it('should also create a pending TaskQueue entry', async () => {
    await axios.post(withUrl(`/api/tasks/${task.id}/comments`), {
      text: 'Triggers queue',
    });

    const queueRepo = dataSource.getRepository(TaskQueueEntity);
    const queues = await queueRepo.find({ where: { taskId: task.id } });

    expect(queues).toHaveLength(1);
    expect(queues[0].status).toBe('pending');
    expect(queues[0].priority).toBe(false);
  });

  it('should not create a duplicate TaskQueue entry when one is already pending', async () => {
    await axios.post(withUrl(`/api/tasks/${task.id}/comments`), {
      text: 'First comment',
    });

    await axios.post(withUrl(`/api/tasks/${task.id}/comments`), {
      text: 'Second comment',
    });

    const queueRepo = dataSource.getRepository(TaskQueueEntity);
    const queues = await queueRepo.find({ where: { taskId: task.id } });

    expect(queues).toHaveLength(1);
  });

  it('should return 404 for non-existent task', async () => {
    try {
      await axios.post(withUrl('/api/tasks/nonexistent/comments'), {
        text: 'Comment',
      });
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  describe('validation', () => {
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
        await axios.post(withUrl(`/api/tasks/${task.id}/comments`), {
          text: '',
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });
});
