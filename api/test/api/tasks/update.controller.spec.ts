import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { TaskEntity } from '../../../src/core/entities/task.entity';
import { TaskQueueEntity } from '../../../src/core/entities/task-queue.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('PATCH /api/tasks/:id', () => {
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
      summary: 'Original Summary',
      description: 'Original Description',
      lastActivityAt: new Date(),
    });
    await taskRepo.save(task);
  });

  afterEach(async () => {
    await dataSource.getRepository(TaskQueueEntity).clear();
    await dataSource.getRepository(TaskEntity).clear();
    await dataSource.getRepository(WorkspaceEntity).clear();
  });

  it('should update the task summary', async () => {
    const res = await axios.patch(withUrl(`/api/tasks/${task.id}`), {
      summary: 'Updated Summary',
    });

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(task.id);
    expect(res.data.summary).toBe('Updated Summary');
  });

  it('should update the task status', async () => {
    const res = await axios.patch(withUrl(`/api/tasks/${task.id}`), {
      status: 'in_progress',
    });

    expect(res.status).toBe(200);
    expect(res.data.status).toBe('in_progress');
  });

  it('should persist the updated values in the database', async () => {
    await axios.patch(withUrl(`/api/tasks/${task.id}`), {
      summary: 'Persisted Summary',
      description: 'Persisted Description',
    });

    const repo = dataSource.getRepository(TaskEntity);
    const updated = await repo.findOne({ where: { id: task.id } });

    expect(updated?.summary).toBe('Persisted Summary');
    expect(updated?.description).toBe('Persisted Description');
  });

  it('should not change fields when not provided', async () => {
    const res = await axios.patch(withUrl(`/api/tasks/${task.id}`), {});

    expect(res.status).toBe(200);
    expect(res.data.summary).toBe('Original Summary');
    expect(res.data.description).toBe('Original Description');
    expect(res.data.status).toBe('todo');
  });

  it('should return 404 for non-existent task', async () => {
    try {
      await axios.patch(withUrl('/api/tasks/nonexistent'), {
        summary: 'New Summary',
      });
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  describe('validation', () => {
    it('should return 400 for invalid status', async () => {
      try {
        await axios.patch(withUrl(`/api/tasks/${task.id}`), {
          status: 'invalid_status',
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 when summary exceeds 255 characters', async () => {
      try {
        await axios.patch(withUrl(`/api/tasks/${task.id}`), {
          summary: 'a'.repeat(256),
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain(
          'summary must be shorter than or equal to 255 characters',
        );
      }
    });

    it('should accept summary with exactly 255 characters', async () => {
      const res = await axios.patch(withUrl(`/api/tasks/${task.id}`), {
        summary: 'a'.repeat(255),
      });

      expect(res.status).toBe(200);
      expect(res.data.summary).toBe('a'.repeat(255));
    });
  });

  describe('queue creation', () => {
    it('should create a pending TaskQueue entry when summary changes', async () => {
      await axios.patch(withUrl(`/api/tasks/${task.id}`), {
        summary: 'New Summary',
      });

      const queueRepo = dataSource.getRepository(TaskQueueEntity);
      const queues = await queueRepo.find({ where: { taskId: task.id } });

      expect(queues).toHaveLength(1);
      expect(queues[0].status).toBe('pending');
    });

    it('should create a pending TaskQueue entry when description changes', async () => {
      await axios.patch(withUrl(`/api/tasks/${task.id}`), {
        description: 'New Description',
      });

      const queueRepo = dataSource.getRepository(TaskQueueEntity);
      const queues = await queueRepo.find({ where: { taskId: task.id } });

      expect(queues).toHaveLength(1);
      expect(queues[0].status).toBe('pending');
    });

    it('should not create a TaskQueue entry for status-only changes', async () => {
      await axios.patch(withUrl(`/api/tasks/${task.id}`), {
        status: 'in_progress',
      });

      const queueRepo = dataSource.getRepository(TaskQueueEntity);
      const queues = await queueRepo.find({ where: { taskId: task.id } });

      expect(queues).toHaveLength(0);
    });

    it('should not create a TaskQueue entry when same summary is sent', async () => {
      await axios.patch(withUrl(`/api/tasks/${task.id}`), {
        summary: 'Original Summary',
      });

      const queueRepo = dataSource.getRepository(TaskQueueEntity);
      const queues = await queueRepo.find({ where: { taskId: task.id } });

      expect(queues).toHaveLength(0);
    });

    it('should update lastActivityAt when summary or description changes', async () => {
      const originalActivityAt = task.lastActivityAt.getTime();

      // Small delay to ensure time difference
      await new Promise((r) => setTimeout(r, 50));

      const res = await axios.patch(withUrl(`/api/tasks/${task.id}`), {
        summary: 'Changed Summary',
      });

      const newActivityAt = new Date(res.data.lastActivityAt).getTime();
      expect(newActivityAt).toBeGreaterThan(originalActivityAt);
    });
  });
});
