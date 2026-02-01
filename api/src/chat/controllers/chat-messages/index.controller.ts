import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PaginatedResponse, PaginationQueryDto } from '../../../core/dtos';
import { ChatMessageEntity } from '../../../core/entities/chat-message.entity';
import { PaginatedChatMessageResponse } from '../../../core/responses';
import { ChatMessagesService } from '../../services/chat-messages.service';

@ApiTags('messages')
@Controller('/api/chats/:chatId/messages')
export class IndexController {
  constructor(private readonly chatMessagesService: ChatMessagesService) {}

  @Get()
  @ApiOperation({
    summary: 'List messages in a chat',
    description: 'Returns a paginated list of all messages in a chat',
  })
  @ApiParam({ name: 'chatId', description: 'Chat ID', example: 'chat_xyz789' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of messages',
    type: PaginatedChatMessageResponse,
  })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async invoke(
    @Param('chatId') chatId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<ChatMessageEntity>> {
    return this.chatMessagesService.findAllByChat(
      chatId,
      query.page,
      query.limit,
    );
  }
}
