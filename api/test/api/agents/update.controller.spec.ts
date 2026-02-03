import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { AgentEntity } from '../../../src/core/entities/agent.entity';
import { WorkspaceEntity } from '../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../utils';

describe('PATCH /api/agents/:id', () => {
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
      name: 'Original Name',
      description: 'Original description',
      instruction: 'Original instruction',
      cliType: 'claude',
      sortOrder: 0,
    });
    await agentRepo.save(agent);
  });

  afterEach(async () => {
    await dataSource.getRepository(AgentEntity).clear();
    await dataSource.getRepository(WorkspaceEntity).clear();
  });

  it('should update name', async () => {
    const res = await axios.patch(withUrl(`/api/agents/${agent.id}`), {
      name: 'Updated Name',
    });

    expect(res.status).toBe(200);
    expect(res.data.name).toBe('Updated Name');
    expect(res.data.description).toBe('Original description');
  });

  it('should update description', async () => {
    const res = await axios.patch(withUrl(`/api/agents/${agent.id}`), {
      description: 'Updated description',
    });

    expect(res.status).toBe(200);
    expect(res.data.description).toBe('Updated description');
    expect(res.data.name).toBe('Original Name');
  });

  it('should update instruction', async () => {
    const res = await axios.patch(withUrl(`/api/agents/${agent.id}`), {
      instruction: 'Updated instruction',
    });

    expect(res.status).toBe(200);
    expect(res.data.instruction).toBe('Updated instruction');
  });

  it('should update cliType', async () => {
    const res = await axios.patch(withUrl(`/api/agents/${agent.id}`), {
      cliType: 'gemini',
    });

    expect(res.status).toBe(200);
    expect(res.data.cliType).toBe('gemini');
  });

  it('should update multiple fields at once', async () => {
    const res = await axios.patch(withUrl(`/api/agents/${agent.id}`), {
      name: 'New Name',
      description: 'New description',
      cliType: 'codex',
    });

    expect(res.status).toBe(200);
    expect(res.data.name).toBe('New Name');
    expect(res.data.description).toBe('New description');
    expect(res.data.cliType).toBe('codex');
  });

  it('should persist changes to the database', async () => {
    await axios.patch(withUrl(`/api/agents/${agent.id}`), {
      name: 'Persisted Name',
    });

    const repo = dataSource.getRepository(AgentEntity);
    const updated = await repo.findOne({ where: { id: agent.id } });

    expect(updated?.name).toBe('Persisted Name');
  });

  it('should return 404 for non-existent agent', async () => {
    try {
      await axios.patch(withUrl('/api/agents/nonexistent'), {
        name: 'New Name',
      });
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  it('should return 400 for invalid cliType', async () => {
    try {
      await axios.patch(withUrl(`/api/agents/${agent.id}`), {
        cliType: 'invalid',
      });
      fail('Expected request to fail');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });
});
