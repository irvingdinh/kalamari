import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ChatMessageEntity } from '../../../core/entities/chat-message.entity';
import { ChatMessageResponse } from '../../../core/responses';
import { CreateChatMessageDto } from '../../dtos';
import { ChatMessagesService } from '../../services/chat-messages.service';

@ApiTags('messages')
@Controller('/api/chats/:chatId/messages')
export class CreateController {
  constructor(private readonly chatMessagesService: ChatMessagesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send a message',
    description:
      'Sends a new message in the chat. This triggers AI processing which will respond asynchronously.',
  })
  @ApiParam({ name: 'chatId', description: 'Chat ID', example: 'chat_xyz789' })
  @ApiBody({ type: CreateChatMessageDto })
  @ApiResponse({
    status: 201,
    description: 'Message created and AI processing started',
    type: ChatMessageResponse,
  })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async invoke(
    @Param('chatId') chatId: string,
    @Body() dto: CreateChatMessageDto,
  ): Promise<ChatMessageEntity> {
    return this.chatMessagesService.create(chatId, dto);
  }
}
