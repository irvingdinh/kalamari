import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { CliType } from '../../cli/types';

export class CreateAgentRequestDto {
  @ApiProperty({
    description: 'Name of the agent',
    example: 'Code Review Assistant',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the agent',
    example: 'An agent specialized in code reviews',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Custom instruction for the agent',
    example: 'You are a helpful code reviewer...',
  })
  @IsOptional()
  @IsString()
  instruction?: string;

  @ApiProperty({
    description: 'CLI type for the agent',
    enum: CliType,
    example: 'claude',
  })
  @IsNotEmpty()
  @IsEnum(CliType)
  cliType: CliType;
}
