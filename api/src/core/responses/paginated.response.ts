import { ApiProperty } from '@nestjs/swagger';

import { ChatWithProcessingResponse } from './chat.response';
import { ChatMessageResponse } from './chat-message.response';
import { WorkspaceResponse } from './workspace.response';

export class PaginationMetaResponse {
  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;
}

export class PaginatedWorkspaceResponse {
  @ApiProperty({
    type: [WorkspaceResponse],
    description: 'Array of workspaces',
  })
  data: WorkspaceResponse[];

  @ApiProperty({
    type: PaginationMetaResponse,
    description: 'Pagination metadata',
  })
  meta: PaginationMetaResponse;
}

export class PaginatedChatResponse {
  @ApiProperty({
    type: [ChatWithProcessingResponse],
    description: 'Array of chats with processing status',
  })
  data: ChatWithProcessingResponse[];

  @ApiProperty({
    type: PaginationMetaResponse,
    description: 'Pagination metadata',
  })
  meta: PaginationMetaResponse;
}

export class PaginatedChatMessageResponse {
  @ApiProperty({
    type: [ChatMessageResponse],
    description: 'Array of chat messages',
  })
  data: ChatMessageResponse[];

  @ApiProperty({
    type: PaginationMetaResponse,
    description: 'Pagination metadata',
  })
  meta: PaginationMetaResponse;
}
