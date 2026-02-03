import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { CliType } from '../../cli/types';

export class UpdateAgentRequestDto {
  @ApiPropertyOptional({
    description: 'New name for the agent',
    example: 'Updated Agent Name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'New description for the agent',
    example: 'Updated description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'New instruction for the agent',
    example: 'Updated instruction text...',
  })
  @IsOptional()
  @IsString()
  instruction?: string;

  @ApiPropertyOptional({
    description: 'New CLI type for the agent',
    enum: CliType,
    example: 'gemini',
  })
  @IsOptional()
  @IsEnum(CliType)
  cliType?: CliType;
}
