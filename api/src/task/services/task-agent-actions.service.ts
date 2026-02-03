import { Injectable, Logger } from '@nestjs/common';

import { AgentCommentActionHandler } from '../agent-actions/agent-comment.action';
import {
  TaskAgentAction,
  TaskAgentActionContext,
  TaskAgentActionHandler,
} from '../agent-actions/types';
import { TaskCommentsService } from './task-comments.service';

@Injectable()
export class TaskAgentActionsService {
  private readonly logger = new Logger(TaskAgentActionsService.name);
  private readonly handlers: Map<string, TaskAgentActionHandler>;

  constructor(
    private readonly taskCommentsService: TaskCommentsService,
    private readonly commentHandler: AgentCommentActionHandler,
  ) {
    this.handlers = new Map();
    this.registerHandler(this.commentHandler);
  }

  private registerHandler(handler: TaskAgentActionHandler): void {
    this.handlers.set(handler.actionType, handler);
  }

  async processActions(
    actions: TaskAgentAction[],
    context: TaskAgentActionContext,
  ): Promise<void> {
    for (const action of actions) {
      const handler = this.handlers.get(action.action);

      if (!handler) {
        this.logger.warn(`No handler found for action type: ${action.action}`);
        await this.taskCommentsService.createSystemComment(
          context.taskId,
          `Unsupported agent action type: ${action.action}`,
        );
        continue;
      }

      try {
        const result = await handler.execute(action, context);

        if (!result.success) {
          this.logger.warn(`Action ${action.action} failed: ${result.error}`);
          await this.taskCommentsService.createSystemComment(
            context.taskId,
            `Failed to process agent action "${action.action}": ${result.error}`,
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Error executing agent action ${action.action}: ${errorMessage}`,
        );
        await this.taskCommentsService.createSystemComment(
          context.taskId,
          `Error processing agent action "${action.action}": ${errorMessage}`,
        );
      }
    }
  }
}
