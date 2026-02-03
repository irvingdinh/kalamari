import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { TASK_STATUS_VALUES, TaskStatus } from '../types';

export class UpdateTaskRequestDto {
  @ApiPropertyOptional({
    description: 'New summary for the task',
    maxLength: 255,
    example: 'Updated task summary',
  })
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsOptional()
  @IsString()
  @MaxLength(255)
  summary?: string;

  @ApiPropertyOptional({
    description: 'New description for the task',
    example: 'Updated description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'New status for the task',
    enum: TASK_STATUS_VALUES,
    example: 'in_progress',
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
