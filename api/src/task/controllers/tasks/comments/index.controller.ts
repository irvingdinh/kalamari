import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  PaginatedResponse,
  PaginationQueryRequestDto,
} from '../../../../core/dtos';
import { TaskCommentEntity } from '../../../../core/entities/task-comment.entity';
import { PaginatedTaskCommentResponseDto } from '../../../dtos';
import { TaskCommentsService } from '../../../services/task-comments.service';

@ApiTags('task-comments')
@Controller('/api/tasks/:taskId/comments')
export class IndexController {
  constructor(private readonly taskCommentsService: TaskCommentsService) {}

  @Get()
  @ApiOperation({
    summary: 'List task comments',
    description:
      'Returns a paginated list of comments for a task. Sorted by created_at DESC.',
  })
  @ApiParam({
    name: 'taskId',
    description: 'Task ID',
    example: 'tsk_abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of task comments',
    type: PaginatedTaskCommentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async invoke(
    @Param('taskId') taskId: string,
    @Query() query: PaginationQueryRequestDto,
  ): Promise<PaginatedResponse<TaskCommentEntity>> {
    return this.taskCommentsService.findAllByTask(
      taskId,
      query.page,
      query.limit,
    );
  }
}
