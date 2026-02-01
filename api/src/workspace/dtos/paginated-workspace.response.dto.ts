import { ApiProperty } from '@nestjs/swagger';

import { PaginationMetaResponseDto } from '../../core/dtos/pagination-meta.response.dto';
import { WorkspaceResponseDto } from './workspace.response.dto';

export class PaginatedWorkspaceResponseDto {
  @ApiProperty({
    type: [WorkspaceResponseDto],
    description: 'Array of workspaces',
  })
  data: WorkspaceResponseDto[];

  @ApiProperty({
    type: PaginationMetaResponseDto,
    description: 'Pagination metadata',
  })
  meta: PaginationMetaResponseDto;
}
