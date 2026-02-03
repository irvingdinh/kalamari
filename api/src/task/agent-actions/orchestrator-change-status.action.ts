import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TaskEntity } from '../../core/entities/task.entity';
import { TaskStatus } from '../types';
import {
  OrchestratorChangeStatusAction,
  TaskActionResult,
  TaskOrchestratorActionContext,
  TaskOrchestratorActionHandler,
} from './types';

const ALLOWED_STATUSES = [TaskStatus.WAIT_FOR_REVIEW, TaskStatus.COMPLETED];

@Injectable()
export class OrchestratorChangeStatusActionHandler implements TaskOrchestratorActionHandler<OrchestratorChangeStatusAction> {
  readonly actionType = 'change_status';

  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
  ) {}

  async execute(
    action: OrchestratorChangeStatusAction,
    context: TaskOrchestratorActionContext,
  ): Promise<TaskActionResult> {
    if (!action.status) {
      return {
        success: false,
        error: 'change_status action requires a status field',
      };
    }

    if (!ALLOWED_STATUSES.includes(action.status as TaskStatus)) {
      return {
        success: false,
        error: `Invalid status "${action.status}". Must be one of: ${ALLOWED_STATUSES.join(', ')}`,
      };
    }

    await this.taskRepository.update(
      { id: context.taskId },
      {
        status: action.status as TaskStatus,
        lastActivityAt: new Date(),
      },
    );

    return { success: true };
  }
}
