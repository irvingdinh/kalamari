import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { TASK_STATUS_VALUES, TaskStatus } from '../types';

export class CreateTaskRequestDto {
  @ApiProperty({
    description: 'Summary of the task',
    maxLength: 255,
    example: 'Implement login page',
  })
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  summary: string;

  @ApiProperty({
    description: 'Detailed description of the task',
    example: 'Create a login page with email and password fields',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Status of the task',
    enum: TASK_STATUS_VALUES,
    default: TaskStatus.BACKLOG,
    example: 'backlog',
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
