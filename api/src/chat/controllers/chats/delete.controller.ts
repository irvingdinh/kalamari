import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ChatsService } from '../../services/chats.service';

@ApiTags('chats')
@Controller('/api/chats')
export class DeleteController {
  constructor(private readonly chatsService: ChatsService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a chat',
    description: 'Permanently deletes a chat and all its messages',
  })
  @ApiParam({ name: 'id', description: 'Chat ID', example: 'chat_xyz789' })
  @ApiResponse({ status: 204, description: 'Chat deleted successfully' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async invoke(@Param('id') id: string): Promise<void> {
    return this.chatsService.remove(id);
  }
}
