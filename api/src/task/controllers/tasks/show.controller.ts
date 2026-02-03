import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { TaskEntity } from '../../../core/entities/task.entity';
import { TaskResponseDto } from '../../dtos';
import { TasksService } from '../../services/tasks.service';

@ApiTags('tasks')
@Controller('/api/tasks')
export class ShowController {
  constructor(private readonly tasksService: TasksService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get a task',
    description: 'Retrieves a single task by its ID',
  })
  @ApiParam({ name: 'id', description: 'Task ID', example: 'tsk_abc123' })
  @ApiResponse({
    status: 200,
    description: 'Task found',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async invoke(@Param('id') id: string): Promise<TaskEntity> {
    return this.tasksService.findOne(id);
  }
}
