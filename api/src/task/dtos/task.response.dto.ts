import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiPropertyOptional({
    description: 'Detailed description of the task',
    example: 'Create a login page with email and password fields',
    nullable: true,
  })
  description: string | null;

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
}
