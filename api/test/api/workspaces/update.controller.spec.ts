import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('PATCH /api/workspaces/:id', () => {
  let app: NestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await destroyTestApp(app);
  });

  afterEach(async () => {
    await dataSource.getRepository(WorkspaceEntity).clear();
  });

  describe('when workspace exists', () => {
    it('should update the workspace name', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);
      const workspace = repo.create({
        id: nanoid(),
        name: 'Original Name',
      });
      await repo.save(workspace);

      const res = await axios.patch(
        withUrl(`/api/workspaces/${workspace.id}`),
        {
          name: 'Updated Name',
        },
      );

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(workspace.id);
      expect(res.data.name).toBe('Updated Name');
    });

    it('should persist the update in the database', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);
      const workspace = repo.create({
        id: nanoid(),
        name: 'Original Name',
      });
      await repo.save(workspace);

      await axios.patch(withUrl(`/api/workspaces/${workspace.id}`), {
        name: 'Persisted Update',
      });

      const updated = await repo.findOne({ where: { id: workspace.id } });
      expect(updated?.name).toBe('Persisted Update');
    });

    it('should return 200 when body is empty (no-op update)', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);
      const workspace = repo.create({
        id: nanoid(),
        name: 'Original Name',
      });
      await repo.save(workspace);

      const res = await axios.patch(
        withUrl(`/api/workspaces/${workspace.id}`),
        {},
      );

      expect(res.status).toBe(200);
      expect(res.data.name).toBe('Original Name');
    });

    it('should update the updatedAt timestamp', async () => {
      // Create workspace with an older timestamp
      const pastDate = new Date(Date.now() - 5000);
      await dataSource
        .createQueryBuilder()
        .insert()
        .into(WorkspaceEntity)
        .values({
          id: 'test-update-timestamp',
          name: 'Original Name',
          createdAt: pastDate,
          updatedAt: pastDate,
        })
        .execute();

      const res = await axios.patch(
        withUrl('/api/workspaces/test-update-timestamp'),
        {
          name: 'Updated Name',
        },
      );

      expect(new Date(res.data.updatedAt as string).getTime()).toBeGreaterThan(
        pastDate.getTime(),
      );
    });

    it('should update the workspace description', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);
      const workspace = repo.create({
        id: nanoid(),
        name: 'Test Workspace',
      });
      await repo.save(workspace);

      const res = await axios.patch(
        withUrl(`/api/workspaces/${workspace.id}`),
        { description: 'Updated description' },
      );

      expect(res.status).toBe(200);
      expect(res.data.description).toBe('Updated description');
      expect(res.data.name).toBe('Test Workspace');
    });

    it('should update the workspace workingDirectory', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);
      const workspace = repo.create({
        id: nanoid(),
        name: 'Test Workspace',
      });
      await repo.save(workspace);

      const res = await axios.patch(
        withUrl(`/api/workspaces/${workspace.id}`),
        { workingDirectory: '/new/path' },
      );

      expect(res.status).toBe(200);
      expect(res.data.workingDirectory).toBe('/new/path');
    });

    it('should update multiple fields at once', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);
      const workspace = repo.create({
        id: nanoid(),
        name: 'Original Name',
      });
      await repo.save(workspace);

      const res = await axios.patch(
        withUrl(`/api/workspaces/${workspace.id}`),
        {
          name: 'New Name',
          description: 'New description',
          workingDirectory: '/new/dir',
        },
      );

      expect(res.status).toBe(200);
      expect(res.data.name).toBe('New Name');
      expect(res.data.description).toBe('New description');
      expect(res.data.workingDirectory).toBe('/new/dir');
    });
  });

  describe('when workspace does not exist', () => {
    it('should return 404', async () => {
      try {
        await axios.patch(withUrl('/api/workspaces/non-existent-id'), {
          name: 'Updated Name',
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toContain('not found');
      }
    });
  });

  describe('validation', () => {
    it('should return 400 when name is not a string', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);
      const workspace = repo.create({
        id: nanoid(),
        name: 'Original Name',
      });
      await repo.save(workspace);

      try {
        await axios.patch(withUrl(`/api/workspaces/${workspace.id}`), {
          name: 123,
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('name must be a string');
      }
    });

    it('should return 400 when name exceeds 255 characters', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);
      const workspace = repo.create({
        id: nanoid(),
        name: 'Original Name',
      });
      await repo.save(workspace);

      try {
        await axios.patch(withUrl(`/api/workspaces/${workspace.id}`), {
          name: 'a'.repeat(256),
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain(
          'name must be shorter than or equal to 255 characters',
        );
      }
    });

    it('should return 400 when description exceeds 1000 characters', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);
      const workspace = repo.create({
        id: nanoid(),
        name: 'Test',
      });
      await repo.save(workspace);

      try {
        await axios.patch(withUrl(`/api/workspaces/${workspace.id}`), {
          description: 'a'.repeat(1001),
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain(
          'description must be shorter than or equal to 1000 characters',
        );
      }
    });

    it('should return 400 when workingDirectory exceeds 255 characters', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);
      const workspace = repo.create({
        id: nanoid(),
        name: 'Test',
      });
      await repo.save(workspace);

      try {
        await axios.patch(withUrl(`/api/workspaces/${workspace.id}`), {
          workingDirectory: 'a'.repeat(256),
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain(
          'workingDirectory must be shorter than or equal to 255 characters',
        );
      }
    });
  });
});
