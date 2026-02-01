import { Body, Controller, Param, Patch } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  ChatWithProcessingResponseDto,
  UpdateChatRequestDto,
} from '../../dtos';
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
  @ApiBody({ type: UpdateChatRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Chat updated successfully',
    type: ChatWithProcessingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async invoke(
    @Param('id') id: string,
    @Body() dto: UpdateChatRequestDto,
  ): Promise<ChatWithProcessing> {
    return this.chatsService.update(id, dto);
  }
}
