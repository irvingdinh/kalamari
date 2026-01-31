import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('GET /api/workspaces/:id', () => {
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
    it('should return the workspace', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);
      const workspace = repo.create({
        id: nanoid(),
        name: 'Test Workspace',
      });
      await repo.save(workspace);

      const res = await axios.get(withUrl(`/api/workspaces/${workspace.id}`));

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(workspace.id);
      expect(res.data.name).toBe('Test Workspace');
      expect(res.data.createdAt).toBeDefined();
      expect(res.data.updatedAt).toBeDefined();
    });
  });

  describe('when workspace does not exist', () => {
    it('should return 404', async () => {
      try {
        await axios.get(withUrl('/api/workspaces/non-existent-id'));
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toContain('not found');
      }
    });
  });
});
