import { ApiProperty } from '@nestjs/swagger';

import { PaginationMetaResponseDto } from '../../core/dtos/pagination-meta.response.dto';
import { TaskResponseDto } from './task.response.dto';

export class PaginatedTaskResponseDto {
  @ApiProperty({
    type: [TaskResponseDto],
    description: 'Array of tasks',
  })
  data: TaskResponseDto[];

  @ApiProperty({
    type: PaginationMetaResponseDto,
    description: 'Pagination metadata',
  })
  meta: PaginationMetaResponseDto;
}
