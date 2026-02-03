import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PaginatedResponse } from '../../../core/dtos';
import { TaskEntity } from '../../../core/entities/task.entity';
import { ListTasksQueryRequestDto, PaginatedTaskResponseDto } from '../../dtos';
import { TasksService } from '../../services/tasks.service';

@ApiTags('tasks')
@Controller('/api/tasks')
export class IndexController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({
    summary: 'List tasks',
    description:
      'Returns a paginated list of tasks, optionally filtered by workspace ID and status. Sorted by last_activity_at DESC.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of tasks',
    type: PaginatedTaskResponseDto,
  })
  async invoke(
    @Query() query: ListTasksQueryRequestDto,
  ): Promise<PaginatedResponse<TaskEntity>> {
    return this.tasksService.findAll(
      query.page,
      query.limit,
      query.workspace_id,
      query.status,
    );
  }
}
