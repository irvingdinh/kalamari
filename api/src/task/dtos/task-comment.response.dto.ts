import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { TASK_COMMENT_ACTOR_TYPE_VALUES, TaskCommentActorType } from '../types';

export class TaskCommentResponseDto {
  @ApiProperty({
    description: 'Unique comment identifier',
    example: 'cmt_abc123',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the task this comment belongs to',
    example: 'tsk_xyz789',
  })
  taskId: string;

  @ApiProperty({
    description: 'Type of actor who created the comment',
    enum: TASK_COMMENT_ACTOR_TYPE_VALUES,
    example: 'user',
  })
  actorType: TaskCommentActorType;

  @ApiPropertyOptional({
    description: 'ID of the actor (only set for agent actors)',
    nullable: true,
    example: null,
  })
  actorId: string | null;

  @ApiProperty({
    description: 'Comment text content',
    example: 'This task needs more details.',
  })
  text: string;

  @ApiProperty({
    description: 'Creation timestamp',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;
}
