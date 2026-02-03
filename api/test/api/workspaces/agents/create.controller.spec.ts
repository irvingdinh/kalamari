import { NestApplication } from '@nestjs/core';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { DataSource } from 'typeorm';

import { AgentEntity } from '../../../../src/core/entities/agent.entity';
import { WorkspaceEntity } from '../../../../src/core/entities/workspace.entity';
import { createTestApp, destroyTestApp, withUrl } from '../../../utils';

describe('POST /api/workspaces/:workspaceId/agents', () => {
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

  describe('with valid data', () => {
    it('should create an agent with required fields and return 201', async () => {
      const res = await axios.post(
        withUrl(`/api/workspaces/${workspace.id}/agents`),
        {
          name: 'Test Agent',
          cliType: 'claude',
        },
      );

      expect(res.status).toBe(201);
      expect(res.data.id).toBeDefined();
      expect(res.data.workspaceId).toBe(workspace.id);
      expect(res.data.name).toBe('Test Agent');
      expect(res.data.cliType).toBe('claude');
      expect(res.data.description).toBeNull();
      expect(res.data.instruction).toBeNull();
      expect(res.data.sortOrder).toBe(0);
      expect(res.data.createdAt).toBeDefined();
      expect(res.data.updatedAt).toBeDefined();
    });

    it('should create an agent with all optional fields', async () => {
      const res = await axios.post(
        withUrl(`/api/workspaces/${workspace.id}/agents`),
        {
          name: 'Full Agent',
          description: 'A description',
          instruction: 'Custom instructions here',
          cliType: 'gemini',
        },
      );

      expect(res.status).toBe(201);
      expect(res.data.description).toBe('A description');
      expect(res.data.instruction).toBe('Custom instructions here');
      expect(res.data.cliType).toBe('gemini');
    });

    it('should auto-increment sortOrder for agents in same workspace', async () => {
      const res1 = await axios.post(
        withUrl(`/api/workspaces/${workspace.id}/agents`),
        {
          name: 'Agent 1',
          cliType: 'claude',
        },
      );
      const res2 = await axios.post(
        withUrl(`/api/workspaces/${workspace.id}/agents`),
        {
          name: 'Agent 2',
          cliType: 'claude',
        },
      );
      const res3 = await axios.post(
        withUrl(`/api/workspaces/${workspace.id}/agents`),
        {
          name: 'Agent 3',
          cliType: 'claude',
        },
      );

      expect(res1.data.sortOrder).toBe(0);
      expect(res2.data.sortOrder).toBe(1);
      expect(res3.data.sortOrder).toBe(2);
    });

    it('should persist the agent in the database', async () => {
      const res = await axios.post(
        withUrl(`/api/workspaces/${workspace.id}/agents`),
        {
          name: 'Persisted Agent',
          cliType: 'codex',
        },
      );

      const repo = dataSource.getRepository(AgentEntity);
      const agent = await repo.findOne({ where: { id: res.data.id } });

      expect(agent).not.toBeNull();
      expect(agent?.name).toBe('Persisted Agent');
      expect(agent?.cliType).toBe('codex');
    });

    it('should generate unique IDs for each agent', async () => {
      const res1 = await axios.post(
        withUrl(`/api/workspaces/${workspace.id}/agents`),
        {
          name: 'Agent 1',
          cliType: 'claude',
        },
      );
      const res2 = await axios.post(
        withUrl(`/api/workspaces/${workspace.id}/agents`),
        {
          name: 'Agent 2',
          cliType: 'claude',
        },
      );

      expect(res1.data.id).not.toBe(res2.data.id);
    });
  });

  describe('validation', () => {
    it('should return 404 when workspace does not exist', async () => {
      try {
        await axios.post(withUrl('/api/workspaces/nonexistent/agents'), {
          name: 'Test',
          cliType: 'claude',
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 400 for invalid cliType', async () => {
      try {
        await axios.post(withUrl(`/api/workspaces/${workspace.id}/agents`), {
          name: 'Test',
          cliType: 'opencode',
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 when name is missing', async () => {
      try {
        await axios.post(withUrl(`/api/workspaces/${workspace.id}/agents`), {
          cliType: 'claude',
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 when cliType is missing', async () => {
      try {
        await axios.post(withUrl(`/api/workspaces/${workspace.id}/agents`), {
          name: 'Test',
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });
});
