import { ApiProperty } from '@nestjs/swagger';

export class ChatResponse {
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

  @ApiProperty({
    description: 'Display name of the chat',
    example: 'Untitled chat',
    default: 'Untitled chat',
  })
  name: string;

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

export class ChatWithProcessingResponse extends ChatResponse {
  @ApiProperty({
    description: 'Whether the chat is currently being processed by an AI agent',
    example: false,
  })
  isProcessing: boolean;
}
