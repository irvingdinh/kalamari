import { ApiProperty } from '@nestjs/swagger';

import { PaginationMetaResponseDto } from '../../core/dtos/pagination-meta.response.dto';
import { ChatWithProcessingResponseDto } from './chat.response.dto';
import { ChatMessageResponseDto } from './chat-message.response.dto';

export class PaginatedChatResponseDto {
  @ApiProperty({
    type: [ChatWithProcessingResponseDto],
    description: 'Array of chats with processing status',
  })
  data: ChatWithProcessingResponseDto[];

  @ApiProperty({
    type: PaginationMetaResponseDto,
    description: 'Pagination metadata',
  })
  meta: PaginationMetaResponseDto;
}

export class PaginatedChatMessageResponseDto {
  @ApiProperty({
    type: [ChatMessageResponseDto],
    description: 'Array of chat messages',
  })
  data: ChatMessageResponseDto[];

  @ApiProperty({
    type: PaginationMetaResponseDto,
    description: 'Pagination metadata',
  })
  meta: PaginationMetaResponseDto;
}
