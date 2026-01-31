import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { DataSource } from 'typeorm';

import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('POST /api/workspaces', () => {
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

  describe('with valid data', () => {
    it('should create a workspace and return 201', async () => {
      const res = await axios.post(withUrl('/api/workspaces'), {
        name: 'New Workspace',
      });

      expect(res.status).toBe(201);
      expect(res.data.id).toBeDefined();
      expect(res.data.name).toBe('New Workspace');
      expect(res.data.createdAt).toBeDefined();
      expect(res.data.updatedAt).toBeDefined();
    });

    it('should persist the workspace in the database', async () => {
      const res = await axios.post(withUrl('/api/workspaces'), {
        name: 'Persisted Workspace',
      });

      const repo = dataSource.getRepository(WorkspaceEntity);
      const workspace = await repo.findOne({ where: { id: res.data.id } });

      expect(workspace).not.toBeNull();
      expect(workspace?.name).toBe('Persisted Workspace');
    });

    it('should generate a unique ID for each workspace', async () => {
      const res1 = await axios.post(withUrl('/api/workspaces'), {
        name: 'Workspace 1',
      });
      const res2 = await axios.post(withUrl('/api/workspaces'), {
        name: 'Workspace 2',
      });

      expect(res1.data.id).not.toBe(res2.data.id);
    });
  });

  describe('validation', () => {
    it('should return 400 when name is missing', async () => {
      try {
        await axios.post(withUrl('/api/workspaces'), {});
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain(
          'name should not be empty',
        );
      }
    });

    it('should return 400 when name is empty string', async () => {
      try {
        await axios.post(withUrl('/api/workspaces'), { name: '' });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain(
          'name should not be empty',
        );
      }
    });

    it('should return 400 when name is not a string', async () => {
      try {
        await axios.post(withUrl('/api/workspaces'), { name: 123 });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('name must be a string');
      }
    });

    it('should return 400 when name exceeds 255 characters', async () => {
      try {
        await axios.post(withUrl('/api/workspaces'), {
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

    it('should accept name with exactly 255 characters', async () => {
      const res = await axios.post(withUrl('/api/workspaces'), {
        name: 'a'.repeat(255),
      });

      expect(res.status).toBe(201);
      expect(res.data.name).toBe('a'.repeat(255));
    });
  });
});
