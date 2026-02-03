import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';

import { TaskCommentEntity } from '../../core/entities/task-comment.entity';
import { TaskCommentActorType } from '../types';
import {
  AgentCommentAction,
  TaskActionResult,
  TaskAgentActionContext,
  TaskAgentActionHandler,
} from './types';

@Injectable()
export class AgentCommentActionHandler implements TaskAgentActionHandler<AgentCommentAction> {
  readonly actionType = 'comment';

  constructor(
    @InjectRepository(TaskCommentEntity)
    private readonly taskCommentRepository: Repository<TaskCommentEntity>,
  ) {}

  async execute(
    action: AgentCommentAction,
    context: TaskAgentActionContext,
  ): Promise<TaskActionResult> {
    if (!action.text) {
      return {
        success: false,
        error: 'Comment action requires a non-empty text field',
      };
    }

    const trimmedText = action.text.trim();
    if (trimmedText.length === 0) {
      return {
        success: false,
        error: 'Comment action requires a non-empty text field',
      };
    }

    const comment = this.taskCommentRepository.create({
      id: nanoid(),
      taskId: context.taskId,
      actorType: TaskCommentActorType.AGENT,
      actorId: context.agentId,
      text: trimmedText,
    });

    await this.taskCommentRepository.save(comment);

    return { success: true };
  }
}
