import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { TasksService } from '../../services/tasks.service';

@ApiTags('tasks')
@Controller('/api/tasks')
export class DeleteController {
  constructor(private readonly tasksService: TasksService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a task',
    description: 'Permanently deletes a task',
  })
  @ApiParam({ name: 'id', description: 'Task ID', example: 'tsk_abc123' })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async invoke(@Param('id') id: string): Promise<void> {
    return this.tasksService.remove(id);
  }
}
