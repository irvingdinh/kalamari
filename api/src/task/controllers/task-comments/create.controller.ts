import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { TaskCommentEntity } from '../../../core/entities/task-comment.entity';
import {
  CreateTaskCommentRequestDto,
  TaskCommentResponseDto,
} from '../../dtos';
import { TaskCommentsService } from '../../services/task-comments.service';

@ApiTags('task-comments')
@Controller('/api/tasks/:taskId/comments')
export class CreateController {
  constructor(private readonly taskCommentsService: TaskCommentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add a comment to a task',
    description:
      'Creates a new comment on the task. This also creates a pending queue entry.',
  })
  @ApiParam({ name: 'taskId', description: 'Task ID', example: 'task_xyz789' })
  @ApiBody({ type: CreateTaskCommentRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Comment created',
    type: TaskCommentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async invoke(
    @Param('taskId') taskId: string,
    @Body() dto: CreateTaskCommentRequestDto,
  ): Promise<TaskCommentEntity> {
    return this.taskCommentsService.create(taskId, dto);
  }
}
