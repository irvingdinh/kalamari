import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('GET /api/workspaces', () => {
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

  describe('with no workspaces', () => {
    it('should return empty data with correct meta structure', async () => {
      const res = await axios.get(withUrl('/api/workspaces'));

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

    it('should respect custom page parameter', async () => {
      const res = await axios.get(withUrl('/api/workspaces?page=2'));

      expect(res.status).toBe(200);
      expect(res.data.meta.page).toBe(2);
    });

    it('should respect custom limit parameter', async () => {
      const res = await axios.get(withUrl('/api/workspaces?limit=5'));

      expect(res.status).toBe(200);
      expect(res.data.meta.limit).toBe(5);
    });

    it('should respect both page and limit parameters', async () => {
      const res = await axios.get(withUrl('/api/workspaces?page=3&limit=25'));

      expect(res.status).toBe(200);
      expect(res.data.meta.page).toBe(3);
      expect(res.data.meta.limit).toBe(25);
    });
  });

  describe('validation', () => {
    it('should return 400 for page less than 1', async () => {
      try {
        await axios.get(withUrl('/api/workspaces?page=0'));
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain(
          'page must not be less than 1',
        );
      }
    });

    it('should return 400 for negative page', async () => {
      try {
        await axios.get(withUrl('/api/workspaces?page=-1'));
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 for limit greater than 100', async () => {
      try {
        await axios.get(withUrl('/api/workspaces?limit=101'));
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain(
          'limit must not be greater than 100',
        );
      }
    });

    it('should return 400 for limit less than 1', async () => {
      try {
        await axios.get(withUrl('/api/workspaces?limit=0'));
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain(
          'limit must not be less than 1',
        );
      }
    });
  });

  describe('with workspaces', () => {
    it('should return created workspaces', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);
      const workspace = repo.create({
        id: nanoid(),
        name: 'Test Workspace',
      });
      await repo.save(workspace);

      const res = await axios.get(withUrl('/api/workspaces'));

      expect(res.status).toBe(200);
      expect(res.data.data).toHaveLength(1);
      expect(res.data.data[0].name).toBe('Test Workspace');
      expect(res.data.meta.total).toBe(1);
      expect(res.data.meta.totalPages).toBe(1);
    });

    it('should paginate correctly with multiple workspaces', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);

      // Create 5 workspaces
      for (let i = 1; i <= 5; i++) {
        const workspace = repo.create({
          id: nanoid(),
          name: `Workspace ${i}`,
        });
        await repo.save(workspace);
      }

      // Request with limit=2
      const res = await axios.get(withUrl('/api/workspaces?limit=2'));

      expect(res.status).toBe(200);
      expect(res.data.data).toHaveLength(2);
      expect(res.data.meta.total).toBe(5);
      expect(res.data.meta.limit).toBe(2);
      expect(res.data.meta.totalPages).toBe(3);
    });

    it('should return correct page of results', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);

      // Create 5 workspaces with delays to ensure ordering
      for (let i = 1; i <= 5; i++) {
        const workspace = repo.create({
          id: nanoid(),
          name: `Workspace ${i}`,
        });
        await repo.save(workspace);
        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Get page 2 with limit 2
      const res = await axios.get(withUrl('/api/workspaces?page=2&limit=2'));

      expect(res.status).toBe(200);
      expect(res.data.data).toHaveLength(2);
      expect(res.data.meta.page).toBe(2);
    });

    it('should order by createdAt DESC (newest first)', async () => {
      // Create workspaces with explicit timestamps using query builder
      const now = new Date();
      await dataSource
        .createQueryBuilder()
        .insert()
        .into(WorkspaceEntity)
        .values([
          {
            id: nanoid(),
            name: 'First',
            createdAt: new Date(now.getTime() - 2000),
            updatedAt: new Date(now.getTime() - 2000),
          },
          {
            id: nanoid(),
            name: 'Second',
            createdAt: new Date(now.getTime() - 1000),
            updatedAt: new Date(now.getTime() - 1000),
          },
          {
            id: nanoid(),
            name: 'Third',
            createdAt: now,
            updatedAt: now,
          },
        ])
        .execute();

      const res = await axios.get(withUrl('/api/workspaces'));

      expect(res.status).toBe(200);
      expect(res.data.data).toHaveLength(3);
      // Newest should be first (ordered by createdAt DESC)
      expect(res.data.data[0].name).toBe('Third');
      expect(res.data.data[1].name).toBe('Second');
      expect(res.data.data[2].name).toBe('First');
    });

    it('should return empty array when page exceeds total pages', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);
      const workspace = repo.create({
        id: nanoid(),
        name: 'Only Workspace',
      });
      await repo.save(workspace);

      const res = await axios.get(withUrl('/api/workspaces?page=10'));

      expect(res.status).toBe(200);
      expect(res.data.data).toHaveLength(0);
      expect(res.data.meta.total).toBe(1);
      expect(res.data.meta.page).toBe(10);
    });
  });
});
