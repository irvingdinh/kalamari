import { Injectable, Logger } from '@nestjs/common';

import { OrchestratorChangeStatusActionHandler } from '../agent-actions/orchestrator-change-status.action';
import { OrchestratorCommentActionHandler } from '../agent-actions/orchestrator-comment.action';
import { OrchestratorTriggerAgentActionHandler } from '../agent-actions/orchestrator-trigger-agent.action';
import {
  OrchestratorTriggerAgentAction,
  TaskOrchestratorAction,
  TaskOrchestratorActionContext,
  TaskOrchestratorActionHandler,
} from '../agent-actions/types';
import { TaskCommentsService } from './task-comments.service';

@Injectable()
export class TaskOrchestratorActionsService {
  private readonly logger = new Logger(TaskOrchestratorActionsService.name);
  private readonly handlers: Map<string, TaskOrchestratorActionHandler>;

  constructor(
    private readonly taskCommentsService: TaskCommentsService,
    private readonly commentHandler: OrchestratorCommentActionHandler,
    private readonly changeStatusHandler: OrchestratorChangeStatusActionHandler,
    private readonly triggerAgentHandler: OrchestratorTriggerAgentActionHandler,
  ) {
    this.handlers = new Map();
    this.registerHandler(this.commentHandler);
    this.registerHandler(this.changeStatusHandler);
    this.registerHandler(this.triggerAgentHandler);
  }

  private registerHandler(handler: TaskOrchestratorActionHandler): void {
    this.handlers.set(handler.actionType, handler);
  }

  async processActions(
    actions: TaskOrchestratorAction[],
    context: TaskOrchestratorActionContext,
  ): Promise<string[]> {
    const triggeredAgentIds: string[] = [];

    for (const action of actions) {
      const handler = this.handlers.get(action.action);

      if (!handler) {
        this.logger.warn(`No handler found for action type: ${action.action}`);
        await this.taskCommentsService.createSystemComment(
          context.taskId,
          `Unsupported action type: ${action.action}`,
        );
        continue;
      }

      try {
        const result = await handler.execute(action, context);

        if (!result.success) {
          this.logger.warn(`Action ${action.action} failed: ${result.error}`);
          await this.taskCommentsService.createSystemComment(
            context.taskId,
            `Failed to process action "${action.action}": ${result.error}`,
          );
        } else if (action.action === 'trigger_agent') {
          triggeredAgentIds.push(
            (action as OrchestratorTriggerAgentAction).agentId,
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Error executing action ${action.action}: ${errorMessage}`,
        );
        await this.taskCommentsService.createSystemComment(
          context.taskId,
          `Error processing action "${action.action}": ${errorMessage}`,
        );
      }
    }

    return triggeredAgentIds;
  }
}
