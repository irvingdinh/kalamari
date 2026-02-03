import { Body, Controller, Param, Patch } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { TaskEntity } from '../../../core/entities/task.entity';
import { TaskResponseDto, UpdateTaskRequestDto } from '../../dtos';
import { TasksService } from '../../services/tasks.service';

@ApiTags('tasks')
@Controller('/api/tasks')
export class UpdateController {
  constructor(private readonly tasksService: TasksService) {}

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a task',
    description:
      'Updates task properties such as summary, description, or status',
  })
  @ApiParam({ name: 'id', description: 'Task ID', example: 'task_xyz789' })
  @ApiBody({ type: UpdateTaskRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async invoke(
    @Param('id') id: string,
    @Body() dto: UpdateTaskRequestDto,
  ): Promise<TaskEntity> {
    return this.tasksService.update(id, dto);
  }
}
