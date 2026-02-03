import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AgentEntity } from '../../core/entities/agent.entity';
import {
  OrchestratorTriggerAgentAction,
  TaskActionResult,
  TaskOrchestratorActionHandler,
} from './types';

@Injectable()
export class OrchestratorTriggerAgentActionHandler implements TaskOrchestratorActionHandler<OrchestratorTriggerAgentAction> {
  readonly actionType = 'trigger_agent';

  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
  ) {}

  async execute(
    action: OrchestratorTriggerAgentAction,
  ): Promise<TaskActionResult> {
    if (!action.agentId) {
      return {
        success: false,
        error: 'trigger_agent action requires an agentId field',
      };
    }

    const agent = await this.agentRepository.findOne({
      where: { id: action.agentId },
    });

    if (!agent) {
      return {
        success: false,
        error: `Agent with ID "${action.agentId}" not found`,
      };
    }

    return { success: true };
  }
}
