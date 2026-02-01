import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ChatWithProcessingResponse } from '../../../core/responses';
import { ChatsService, ChatWithProcessing } from '../../services/chats.service';

@ApiTags('chats')
@Controller('/api/chats')
export class CancelController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel chat processing',
    description:
      'Cancels any pending or in-progress AI processing for this chat',
  })
  @ApiParam({ name: 'id', description: 'Chat ID', example: 'chat_xyz789' })
  @ApiResponse({
    status: 200,
    description: 'Processing cancelled',
    type: ChatWithProcessingResponse,
  })
  @ApiResponse({ status: 400, description: 'Chat is not being processed' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async invoke(@Param('id') id: string): Promise<ChatWithProcessing> {
    return this.chatsService.cancel(id);
  }
}
