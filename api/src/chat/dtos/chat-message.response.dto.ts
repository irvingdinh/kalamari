import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatMessageResponseDto {
  @ApiProperty({
    description: 'Unique message identifier',
    example: 'msg_abc123',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the chat this message belongs to',
    example: 'chat_xyz789',
  })
  chatId: string;

  @ApiProperty({
    description: 'Type of actor who sent the message',
    example: 'user',
    enum: ['user', 'agent'],
  })
  actorType: string;

  @ApiPropertyOptional({
    description: 'Identifier of the specific actor (e.g., agent type)',
    example: 'claude',
    nullable: true,
  })
  actorId: string | null;

  @ApiProperty({
    description: 'Message content text',
    example: 'Can you help me refactor this function?',
  })
  text: string;

  @ApiProperty({
    description: 'Message creation timestamp',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;
}
