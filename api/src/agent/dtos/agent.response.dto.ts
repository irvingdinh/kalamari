import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CLI_TYPE_VALUES } from '../../cli/types';

export class AgentResponseDto {
  @ApiProperty({
    description: 'Unique agent identifier',
    example: 'agt_abc123',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the workspace this agent belongs to',
    example: 'ws_xyz789',
  })
  workspaceId: string;

  @ApiProperty({
    description: 'Display name of the agent',
    example: 'Code Review Assistant',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the agent',
    example: 'An agent specialized in code reviews',
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Custom instruction for the agent',
    example: 'You are a helpful code reviewer...',
    nullable: true,
  })
  instruction: string | null;

  @ApiProperty({
    description: 'CLI type for the agent',
    enum: CLI_TYPE_VALUES,
    example: 'claude',
  })
  cliType: string;

  @ApiProperty({
    description: 'Sort order within the workspace',
    example: 0,
  })
  sortOrder: number;

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
