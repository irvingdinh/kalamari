import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';

import { ChatMessageEntity } from '../../../core/entities/chat-message.entity';
import { CreateChatMessageDto } from '../../dtos';
import { ChatMessagesService } from '../../services/chat-messages.service';

@Controller('/api/chats/:chatId/messages')
export class CreateController {
  constructor(private readonly chatMessagesService: ChatMessagesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async invoke(
    @Param('chatId') chatId: string,
    @Body() dto: CreateChatMessageDto,
  ): Promise<ChatMessageEntity> {
    return this.chatMessagesService.create(chatId, dto);
  }
}
