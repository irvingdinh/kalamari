import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { WorkspaceResponseDto } from '../../workspace/dtos';
import { TASK_STATUS_VALUES, TaskStatus } from '../types';

export class TaskResponseDto {
  @ApiProperty({
    description: 'Unique task identifier',
    example: 'tsk_abc123',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the workspace this task belongs to',
    example: 'ws_xyz789',
  })
  workspaceId: string;

  @ApiProperty({
    description: 'Summary of the task',
    example: 'Implement login page',
  })
  summary: string;

  @ApiProperty({
    description: 'Detailed description of the task',
    example: 'Create a login page with email and password fields',
  })
  description: string;

  @ApiProperty({
    description: 'Current status of the task',
    enum: TASK_STATUS_VALUES,
    example: 'backlog',
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'Timestamp of the last activity on the task',
    type: String,
    format: 'date-time',
  })
  lastActivityAt: Date;

  @ApiProperty({
    description: 'Creation timestamp',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description:
      'Workspace details. Only included when include=workspace is specified.',
    type: WorkspaceResponseDto,
  })
  workspace?: WorkspaceResponseDto;
}
