import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskCommentResponseDto {
  @ApiProperty({
    description: 'Unique comment identifier',
    example: 'cmt_abc123',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the task this comment belongs to',
    example: 'task_xyz789',
  })
  taskId: string;

  @ApiProperty({
    description: 'Type of actor who created the comment',
    example: 'user',
    enum: ['user', 'agent'],
  })
  actorType: string;

  @ApiPropertyOptional({
    description: 'Identifier of the specific actor',
    example: null,
    nullable: true,
  })
  actorId: string | null;

  @ApiProperty({
    description: 'Comment text content',
    example: 'I think we should approach this differently.',
  })
  text: string;

  @ApiProperty({
    description: 'Comment creation timestamp',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;
}
