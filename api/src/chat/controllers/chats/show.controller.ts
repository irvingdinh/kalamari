import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ChatWithProcessingResponse } from '../../../core/responses';
import { ChatsService, ChatWithProcessing } from '../../services/chats.service';

@ApiTags('chats')
@Controller('/api/chats')
export class ShowController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get a chat',
    description:
      'Retrieves a single chat by its ID, including its processing status',
  })
  @ApiParam({ name: 'id', description: 'Chat ID', example: 'chat_xyz789' })
  @ApiResponse({
    status: 200,
    description: 'Chat found',
    type: ChatWithProcessingResponse,
  })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async invoke(@Param('id') id: string): Promise<ChatWithProcessing> {
    return this.chatsService.findOne(id);
  }
}
