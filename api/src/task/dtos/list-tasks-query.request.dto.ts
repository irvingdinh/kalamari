import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationQueryRequestDto } from '../../core/dtos';
import { TASK_STATUS_VALUES, TaskStatus } from '../types';

export class ListTasksQueryRequestDto extends PaginationQueryRequestDto {
  @ApiPropertyOptional({
    description:
      'Filter tasks by workspace ID. If not provided, returns tasks from all workspaces.',
    example: 'ws_abc123',
  })
  @IsOptional()
  @IsString()
  workspace_id?: string;

  @ApiPropertyOptional({
    description: 'Filter tasks by status.',
    enum: TASK_STATUS_VALUES,
    example: 'backlog',
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    description:
      'Comma-separated list of relations to include. Supported: workspace.',
    example: 'workspace',
  })
  @IsOptional()
  @IsString()
  include?: string;
}
