import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { TASK_STATUS_VALUES } from '../types';

export class UpdateTaskRequestDto {
  @ApiPropertyOptional({
    description: 'Short summary of the task',
    maxLength: 255,
    example: 'Fix login page styling',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  summary?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the task',
    example: 'The login button is misaligned on mobile viewports.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Task status',
    enum: TASK_STATUS_VALUES,
    example: 'in_progress',
  })
  @IsOptional()
  @IsIn(TASK_STATUS_VALUES)
  status?: string;
}
