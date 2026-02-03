import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { CliType } from '../../cli/types';

export class CreateChatRequestDto {
  @ApiPropertyOptional({
    description: 'Display name for the chat',
    maxLength: 255,
    example: 'API Design Discussion',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'ID of the agent to use for this chat',
    example: 'agent_abc123',
  })
  @IsOptional()
  @IsString()
  agentId?: string;

  @ApiPropertyOptional({
    description: 'CLI type override for this chat',
    enum: CliType,
    example: 'claude',
  })
  @IsOptional()
  @IsEnum(CliType)
  cliType?: CliType;
}
