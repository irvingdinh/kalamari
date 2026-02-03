import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  PaginatedResponse,
  PaginationQueryRequestDto,
} from '../../../core/dtos';
import { TaskCommentEntity } from '../../../core/entities/task-comment.entity';
import { PaginatedTaskCommentResponseDto } from '../../dtos';
import { TaskCommentsService } from '../../services/task-comments.service';

@ApiTags('task-comments')
@Controller('/api/tasks/:taskId/comments')
export class IndexController {
  constructor(private readonly taskCommentsService: TaskCommentsService) {}

  @Get()
  @ApiOperation({
    summary: 'List comments on a task',
    description: 'Returns a paginated list of all comments on a task',
  })
  @ApiParam({ name: 'taskId', description: 'Task ID', example: 'task_xyz789' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of comments',
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
