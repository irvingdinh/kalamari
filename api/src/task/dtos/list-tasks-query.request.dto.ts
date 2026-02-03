import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

import { PaginationQueryRequestDto } from '../../core/dtos';
import { TASK_STATUS_VALUES } from '../types';

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
    example: 'todo',
    enum: TASK_STATUS_VALUES,
  })
  @IsOptional()
  @IsIn(TASK_STATUS_VALUES)
  status?: string;
}
