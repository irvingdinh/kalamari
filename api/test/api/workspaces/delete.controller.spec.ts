import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('DELETE /api/workspaces/:id', () => {
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
    it('should delete the workspace and return 204', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);
      const workspace = repo.create({
        id: nanoid(),
        name: 'To Be Deleted',
      });
      await repo.save(workspace);

      const res = await axios.delete(
        withUrl(`/api/workspaces/${workspace.id}`),
      );

      expect(res.status).toBe(204);
      expect(res.data).toBe('');
    });

    it('should remove the workspace from the database', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);
      const workspace = repo.create({
        id: nanoid(),
        name: 'To Be Deleted',
      });
      await repo.save(workspace);

      await axios.delete(withUrl(`/api/workspaces/${workspace.id}`));

      const deleted = await repo.findOne({ where: { id: workspace.id } });
      expect(deleted).toBeNull();
    });

    it('should not affect other workspaces', async () => {
      const repo = dataSource.getRepository(WorkspaceEntity);
      const workspace1 = repo.create({
        id: nanoid(),
        name: 'Workspace 1',
      });
      const workspace2 = repo.create({
        id: nanoid(),
        name: 'Workspace 2',
      });
      await repo.save([workspace1, workspace2]);

      await axios.delete(withUrl(`/api/workspaces/${workspace1.id}`));

      const remaining = await repo.find();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(workspace2.id);
    });
  });

  describe('when workspace does not exist', () => {
    it('should return 404', async () => {
      try {
        await axios.delete(withUrl('/api/workspaces/non-existent-id'));
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toContain('not found');
      }
    });
  });
});
