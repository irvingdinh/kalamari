import { ApiProperty } from '@nestjs/swagger';

import { PaginationMetaResponseDto } from '../../core/dtos/pagination-meta.response.dto';
import { TaskCommentResponseDto } from './task-comment.response.dto';

export class PaginatedTaskCommentResponseDto {
  @ApiProperty({
    type: [TaskCommentResponseDto],
    description: 'Array of task comments',
  })
  data: TaskCommentResponseDto[];

  @ApiProperty({
    type: PaginationMetaResponseDto,
    description: 'Pagination metadata',
  })
  meta: PaginationMetaResponseDto;
}
