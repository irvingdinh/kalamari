import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { AgentEntity } from '../../../src/core/entities/agent.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('GET /api/agents', () => {
  let app: NestApplication;
  let dataSource: DataSource;
  let workspace: WorkspaceEntity;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await destroyTestApp(app);
  });

  beforeEach(async () => {
    const repo = dataSource.getRepository(WorkspaceEntity);
    workspace = repo.create({
      id: nanoid(),
      name: 'Test Workspace',
    });
    await repo.save(workspace);
  });

  afterEach(async () => {
    await dataSource.getRepository(AgentEntity).clear();
    await dataSource.getRepository(WorkspaceEntity).clear();
  });

  describe('without workspace_id filter', () => {
    it('should return empty array when no agents exist', async () => {
      const res = await axios.get(withUrl('/api/agents'));

      expect(res.status).toBe(200);
      expect(res.data).toEqual([]);
    });

    it('should return all agents across all workspaces', async () => {
      const workspaceRepo = dataSource.getRepository(WorkspaceEntity);
      const otherWorkspace = workspaceRepo.create({
        id: nanoid(),
        name: 'Other Workspace',
      });
      await workspaceRepo.save(otherWorkspace);

      const agentRepo = dataSource.getRepository(AgentEntity);
      await agentRepo.save([
        agentRepo.create({
          id: nanoid(),
          workspaceId: workspace.id,
          name: 'Agent 1',
          cliType: 'claude',
          sortOrder: 0,
        }),
        agentRepo.create({
          id: nanoid(),
          workspaceId: otherWorkspace.id,
          name: 'Agent 2',
          cliType: 'gemini',
          sortOrder: 0,
        }),
      ]);

      const res = await axios.get(withUrl('/api/agents'));

      expect(res.status).toBe(200);
      expect(res.data).toHaveLength(2);
    });
  });

  describe('with workspace_id filter', () => {
    it('should return empty array for workspace with no agents', async () => {
      const res = await axios.get(
        withUrl(`/api/agents?workspace_id=${workspace.id}`),
      );

      expect(res.status).toBe(200);
      expect(res.data).toEqual([]);
    });

    it('should return agents for the specified workspace only', async () => {
      const workspaceRepo = dataSource.getRepository(WorkspaceEntity);
      const otherWorkspace = workspaceRepo.create({
        id: nanoid(),
        name: 'Other Workspace',
      });
      await workspaceRepo.save(otherWorkspace);

      const agentRepo = dataSource.getRepository(AgentEntity);
      await agentRepo.save([
        agentRepo.create({
          id: nanoid(),
          workspaceId: workspace.id,
          name: 'My Agent',
          cliType: 'claude',
          sortOrder: 0,
        }),
        agentRepo.create({
          id: nanoid(),
          workspaceId: otherWorkspace.id,
          name: 'Other Agent',
          cliType: 'gemini',
          sortOrder: 0,
        }),
      ]);

      const res = await axios.get(
        withUrl(`/api/agents?workspace_id=${workspace.id}`),
      );

      expect(res.status).toBe(200);
      expect(res.data).toHaveLength(1);
      expect(res.data[0].name).toBe('My Agent');
    });

    it('should return empty result for non-existent workspace', async () => {
      const res = await axios.get(
        withUrl('/api/agents?workspace_id=nonexistent'),
      );

      expect(res.status).toBe(200);
      expect(res.data).toEqual([]);
    });
  });

  describe('sorting', () => {
    it('should order by sortOrder ASC, createdAt DESC', async () => {
      const agentRepo = dataSource.getRepository(AgentEntity);
      const now = new Date();

      await agentRepo.save([
        agentRepo.create({
          id: nanoid(),
          workspaceId: workspace.id,
          name: 'Agent C',
          cliType: 'claude',
          sortOrder: 2,
          createdAt: now,
        }),
        agentRepo.create({
          id: nanoid(),
          workspaceId: workspace.id,
          name: 'Agent A',
          cliType: 'claude',
          sortOrder: 0,
          createdAt: new Date(now.getTime() - 1000),
        }),
        agentRepo.create({
          id: nanoid(),
          workspaceId: workspace.id,
          name: 'Agent B',
          cliType: 'claude',
          sortOrder: 1,
          createdAt: now,
        }),
      ]);

      const res = await axios.get(
        withUrl(`/api/agents?workspace_id=${workspace.id}`),
      );

      expect(res.status).toBe(200);
      expect(res.data).toHaveLength(3);
      expect(res.data[0].name).toBe('Agent A');
      expect(res.data[1].name).toBe('Agent B');
      expect(res.data[2].name).toBe('Agent C');
    });
  });
});
