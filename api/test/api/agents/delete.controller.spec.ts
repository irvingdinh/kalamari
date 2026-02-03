import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { AgentEntity } from '../../../src/core/entities/agent.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('DELETE /api/agents/:id', () => {
  let app: NestApplication;
  let dataSource: DataSource;
  let workspace: WorkspaceEntity;
  let agent: AgentEntity;

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

    const agentRepo = dataSource.getRepository(AgentEntity);
    agent = agentRepo.create({
      id: nanoid(),
      workspaceId: workspace.id,
      name: 'Test Agent',
      cliType: 'claude',
      sortOrder: 0,
    });
    await agentRepo.save(agent);
  });

  afterEach(async () => {
    await dataSource.getRepository(AgentEntity).clear();
    await dataSource.getRepository(WorkspaceEntity).clear();
  });

  it('should delete agent and return 204', async () => {
    const res = await axios.delete(withUrl(`/api/agents/${agent.id}`));

    expect(res.status).toBe(204);
  });

  it('should remove agent from database', async () => {
    await axios.delete(withUrl(`/api/agents/${agent.id}`));

    const repo = dataSource.getRepository(AgentEntity);
    const deleted = await repo.findOne({ where: { id: agent.id } });

    expect(deleted).toBeNull();
  });

  it('should return 404 for non-existent agent', async () => {
    try {
      await axios.delete(withUrl('/api/agents/nonexistent'));
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  describe('cascade delete', () => {
    it('should delete agents when workspace is deleted', async () => {
      const agentRepo = dataSource.getRepository(AgentEntity);

      // Create another agent
      const agent2 = agentRepo.create({
        id: nanoid(),
        workspaceId: workspace.id,
        name: 'Agent 2',
        cliType: 'gemini',
        sortOrder: 1,
      });
      await agentRepo.save(agent2);

      // Delete workspace
      await axios.delete(withUrl(`/api/workspaces/${workspace.id}`));

      // Verify agents are deleted
      const agents = await agentRepo.find({
        where: { workspaceId: workspace.id },
      });

      expect(agents).toHaveLength(0);
    });
  });
});
