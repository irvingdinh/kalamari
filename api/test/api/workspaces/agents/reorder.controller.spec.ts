import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { AgentEntity } from '../../../../src/core/entities/agent.entity';
import { WorkspaceEntity } from '../../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../../utils';

describe('PUT /api/workspaces/:workspaceId/agents/reorder', () => {
  let app: NestApplication;
  let dataSource: DataSource;
  let workspace: WorkspaceEntity;
  let agents: AgentEntity[];

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
    agents = await agentRepo.save([
      agentRepo.create({
        id: nanoid(),
        workspaceId: workspace.id,
        name: 'Agent A',
        cliType: 'claude',
        sortOrder: 0,
      }),
      agentRepo.create({
        id: nanoid(),
        workspaceId: workspace.id,
        name: 'Agent B',
        cliType: 'claude',
        sortOrder: 1,
      }),
      agentRepo.create({
        id: nanoid(),
        workspaceId: workspace.id,
        name: 'Agent C',
        cliType: 'claude',
        sortOrder: 2,
      }),
    ]);
  });

  afterEach(async () => {
    await dataSource.getRepository(AgentEntity).clear();
    await dataSource.getRepository(WorkspaceEntity).clear();
  });

  it('should reorder agents and return updated list', async () => {
    const newOrder = [agents[2].id, agents[0].id, agents[1].id];

    const res = await axios.put(
      withUrl(`/api/workspaces/${workspace.id}/agents/reorder`),
      { agentIds: newOrder },
    );

    expect(res.status).toBe(200);
    expect(res.data).toHaveLength(3);
    expect(res.data[0].id).toBe(agents[2].id);
    expect(res.data[0].sortOrder).toBe(0);
    expect(res.data[1].id).toBe(agents[0].id);
    expect(res.data[1].sortOrder).toBe(1);
    expect(res.data[2].id).toBe(agents[1].id);
    expect(res.data[2].sortOrder).toBe(2);
  });

  it('should persist reorder changes to database', async () => {
    const newOrder = [agents[2].id, agents[1].id, agents[0].id];

    await axios.put(withUrl(`/api/workspaces/${workspace.id}/agents/reorder`), {
      agentIds: newOrder,
    });

    const repo = dataSource.getRepository(AgentEntity);
    const updated = await repo.find({
      where: { workspaceId: workspace.id },
      order: { sortOrder: 'ASC' },
    });

    expect(updated[0].id).toBe(agents[2].id);
    expect(updated[1].id).toBe(agents[1].id);
    expect(updated[2].id).toBe(agents[0].id);
  });

  it('should work with empty workspace', async () => {
    const emptyWorkspaceRepo = dataSource.getRepository(WorkspaceEntity);
    const emptyWorkspace = emptyWorkspaceRepo.create({
      id: nanoid(),
      name: 'Empty Workspace',
    });
    await emptyWorkspaceRepo.save(emptyWorkspace);

    const res = await axios.put(
      withUrl(`/api/workspaces/${emptyWorkspace.id}/agents/reorder`),
      { agentIds: [] },
    );

    expect(res.status).toBe(200);
    expect(res.data).toEqual([]);
  });

  describe('validation', () => {
    it('should return 404 for non-existent workspace', async () => {
      try {
        await axios.put(withUrl('/api/workspaces/nonexistent/agents/reorder'), {
          agentIds: [],
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 400 for duplicate agent IDs', async () => {
      try {
        await axios.put(
          withUrl(`/api/workspaces/${workspace.id}/agents/reorder`),
          { agentIds: [agents[0].id, agents[0].id, agents[1].id] },
        );
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 when missing agents', async () => {
      try {
        await axios.put(
          withUrl(`/api/workspaces/${workspace.id}/agents/reorder`),
          { agentIds: [agents[0].id, agents[1].id] },
        );
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 for extra agent IDs', async () => {
      try {
        await axios.put(
          withUrl(`/api/workspaces/${workspace.id}/agents/reorder`),
          { agentIds: [agents[0].id, agents[1].id, agents[2].id, 'extra'] },
        );
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 for agent ID from different workspace', async () => {
      const otherWorkspaceRepo = dataSource.getRepository(WorkspaceEntity);
      const otherWorkspace = otherWorkspaceRepo.create({
        id: nanoid(),
        name: 'Other Workspace',
      });
      await otherWorkspaceRepo.save(otherWorkspace);

      const otherAgentRepo = dataSource.getRepository(AgentEntity);
      const otherAgent = otherAgentRepo.create({
        id: nanoid(),
        workspaceId: otherWorkspace.id,
        name: 'Other Agent',
        cliType: 'claude',
        sortOrder: 0,
      });
      await otherAgentRepo.save(otherAgent);

      try {
        await axios.put(
          withUrl(`/api/workspaces/${workspace.id}/agents/reorder`),
          { agentIds: [agents[0].id, agents[1].id, otherAgent.id] },
        );
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });
});
