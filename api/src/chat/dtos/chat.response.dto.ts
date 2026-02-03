import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({
    description: 'Unique chat identifier',
    example: 'chat_abc123',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the workspace this chat belongs to',
    example: 'ws_xyz789',
  })
  workspaceId: string;

  @ApiPropertyOptional({
    description: 'ID of the agent associated with this chat',
    example: 'agent_abc123',
    nullable: true,
  })
  agentId: string | null;

  @ApiProperty({
    description: 'Display name of the chat',
    example: 'Untitled chat',
    default: 'Untitled chat',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'CLI type override for this chat',
    example: 'claude',
    nullable: true,
  })
  cliType: string | null;

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

export class ChatWithProcessingResponseDto extends ChatResponseDto {
  @ApiProperty({
    description: 'Whether the chat is currently being processed by an AI agent',
    example: false,
  })
  isProcessing: boolean;
}
