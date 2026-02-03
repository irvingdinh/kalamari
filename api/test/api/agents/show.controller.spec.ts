import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { AgentEntity } from '../../../src/core/entities/agent.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('GET /api/agents/:id', () => {
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

  it('should return agent by id', async () => {
    const agentRepo = dataSource.getRepository(AgentEntity);
    const agent = agentRepo.create({
      id: nanoid(),
      workspaceId: workspace.id,
      name: 'Test Agent',
      description: 'A test agent',
      instruction: 'Be helpful',
      cliType: 'claude',
      sortOrder: 0,
    });
    await agentRepo.save(agent);

    const res = await axios.get(withUrl(`/api/agents/${agent.id}`));

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(agent.id);
    expect(res.data.workspaceId).toBe(workspace.id);
    expect(res.data.name).toBe('Test Agent');
    expect(res.data.description).toBe('A test agent');
    expect(res.data.instruction).toBe('Be helpful');
    expect(res.data.cliType).toBe('claude');
    expect(res.data.sortOrder).toBe(0);
    expect(res.data.createdAt).toBeDefined();
    expect(res.data.updatedAt).toBeDefined();
  });

  it('should return 404 for non-existent agent', async () => {
    try {
      await axios.get(withUrl('/api/agents/nonexistent'));
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });
});
