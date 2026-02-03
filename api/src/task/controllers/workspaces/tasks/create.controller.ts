import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { TaskEntity } from '../../../../core/entities/task.entity';
import { CreateTaskRequestDto, TaskResponseDto } from '../../../dtos';
import { TasksService } from '../../../services/tasks.service';

@ApiTags('tasks')
@Controller('/api/workspaces/:workspaceId/tasks')
export class CreateController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new task',
    description: 'Creates a new task in the specified workspace',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID',
    example: 'ws_abc123',
  })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async invoke(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateTaskRequestDto,
  ): Promise<TaskEntity> {
    return this.tasksService.create(workspaceId, dto);
  }
}
