import { ApiProperty } from '@nestjs/swagger';

import { TASK_STATUS_VALUES } from '../types';

export class TaskResponseDto {
  @ApiProperty({
    description: 'Unique task identifier',
    example: 'task_abc123',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the workspace this task belongs to',
    example: 'ws_xyz789',
  })
  workspaceId: string;

  @ApiProperty({
    description: 'Short summary of the task',
    example: 'Fix login page styling',
  })
  summary: string;

  @ApiProperty({
    description: 'Detailed description of the task',
    example: 'The login button is misaligned on mobile viewports.',
  })
  description: string;

  @ApiProperty({
    description: 'Task status',
    example: 'todo',
    enum: TASK_STATUS_VALUES,
  })
  status: string;

  @ApiProperty({
    description: 'Timestamp of the last activity on this task',
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
