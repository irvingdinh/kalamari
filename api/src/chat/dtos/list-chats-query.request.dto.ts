import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryRequestDto } from '../../core/dtos';

export class ListChatsQueryRequestDto extends PaginationQueryRequestDto {
  @ApiPropertyOptional({
    description:
      'Filter chats by workspace ID. If not provided, returns chats from all workspaces.',
    example: 'ws_abc123',
  })
  @IsOptional()
  @IsString()
  workspace_id?: string;
}
