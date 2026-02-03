import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { TaskEntity } from '../../../src/core/entities/task.entity';
import { TaskCommentEntity } from '../../../src/core/entities/task-comment.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('GET /api/tasks/:taskId/comments', () => {
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
    await dataSource.getRepository(TaskEntity).clear();
    await dataSource.getRepository(WorkspaceEntity).clear();
  });

  it('should return empty data when no comments exist', async () => {
    const res = await axios.get(withUrl(`/api/tasks/${task.id}/comments`));

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

  it('should return comments for the task', async () => {
    const commentRepo = dataSource.getRepository(TaskCommentEntity);
    await commentRepo.save(
      commentRepo.create({
        id: nanoid(),
        taskId: task.id,
        actorType: 'user',
        actorId: null,
        text: 'Hello',
      }),
    );

    const res = await axios.get(withUrl(`/api/tasks/${task.id}/comments`));

    expect(res.status).toBe(200);
    expect(res.data.data).toHaveLength(1);
    expect(res.data.data[0].text).toBe('Hello');
    expect(res.data.data[0].actorType).toBe('user');
    expect(res.data.data[0].actorId).toBeNull();
    expect(res.data.meta.total).toBe(1);
  });

  it('should paginate correctly', async () => {
    const commentRepo = dataSource.getRepository(TaskCommentEntity);

    for (let i = 1; i <= 5; i++) {
      await commentRepo.save(
        commentRepo.create({
          id: nanoid(),
          taskId: task.id,
          actorType: 'user',
          actorId: null,
          text: `Comment ${i}`,
        }),
      );
    }

    const res = await axios.get(
      withUrl(`/api/tasks/${task.id}/comments?limit=2`),
    );

    expect(res.status).toBe(200);
    expect(res.data.data).toHaveLength(2);
    expect(res.data.meta.total).toBe(5);
    expect(res.data.meta.totalPages).toBe(3);
  });

  it('should order by createdAt DESC (newest first)', async () => {
    const now = new Date();
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(TaskCommentEntity)
      .values([
        {
          id: nanoid(),
          taskId: task.id,
          actorType: 'user',
          actorId: null,
          text: 'First',
          createdAt: new Date(now.getTime() - 2000),
        },
        {
          id: nanoid(),
          taskId: task.id,
          actorType: 'user',
          actorId: null,
          text: 'Second',
          createdAt: new Date(now.getTime() - 1000),
        },
        {
          id: nanoid(),
          taskId: task.id,
          actorType: 'user',
          actorId: null,
          text: 'Third',
          createdAt: now,
        },
      ])
      .execute();

    const res = await axios.get(withUrl(`/api/tasks/${task.id}/comments`));

    expect(res.status).toBe(200);
    expect(res.data.data).toHaveLength(3);
    expect(res.data.data[0].text).toBe('Third');
    expect(res.data.data[1].text).toBe('Second');
    expect(res.data.data[2].text).toBe('First');
  });

  it('should return 404 for non-existent task', async () => {
    try {
      await axios.get(withUrl('/api/tasks/nonexistent/comments'));
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });
});
