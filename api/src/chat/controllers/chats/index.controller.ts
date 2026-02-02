import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PaginatedResponse } from '../../../core/dtos';
import { ListChatsQueryRequestDto, PaginatedChatResponseDto } from '../../dtos';
import { ChatsService, ChatWithProcessing } from '../../services/chats.service';

@ApiTags('chats')
@Controller('/api/chats')
export class IndexController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  @ApiOperation({
    summary: 'List chats',
    description: 'Returns a paginated list of chats.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of chats',
    type: PaginatedChatResponseDto,
  })
  async invoke(
    @Query() query: ListChatsQueryRequestDto,
  ): Promise<PaginatedResponse<ChatWithProcessing>> {
    return this.chatsService.findAll(
      query.page,
      query.limit,
      query.workspace_id,
    );
  }
}
