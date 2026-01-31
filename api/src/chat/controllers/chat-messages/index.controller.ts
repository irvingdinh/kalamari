import { Controller, Get, Param, Query } from '@nestjs/common';

import { PaginatedResponse, PaginationQueryDto } from '../../../core/dtos';
import { ChatMessageEntity } from '../../../core/entities/chat-message.entity';
import { ChatMessagesService } from '../../services/chat-messages.service';

@Controller('/api/chats/:chatId/messages')
export class IndexController {
  constructor(private readonly chatMessagesService: ChatMessagesService) {}

  @Get()
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
