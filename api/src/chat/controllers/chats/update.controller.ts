import { Body, Controller, Param, Patch } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ChatWithProcessingResponse } from '../../../core/responses';
import { UpdateChatDto } from '../../dtos';
import { ChatsService, ChatWithProcessing } from '../../services/chats.service';

@ApiTags('chats')
@Controller('/api/chats')
export class UpdateController {
  constructor(private readonly chatsService: ChatsService) {}

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a chat',
    description: 'Updates chat properties such as the name',
  })
  @ApiParam({ name: 'id', description: 'Chat ID', example: 'chat_xyz789' })
  @ApiBody({ type: UpdateChatDto })
  @ApiResponse({
    status: 200,
    description: 'Chat updated successfully',
    type: ChatWithProcessingResponse,
  })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async invoke(
    @Param('id') id: string,
    @Body() dto: UpdateChatDto,
  ): Promise<ChatWithProcessing> {
    return this.chatsService.update(id, dto);
  }
}
