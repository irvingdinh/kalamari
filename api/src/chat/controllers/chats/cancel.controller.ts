import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';

import { ChatsService, ChatWithProcessing } from '../../services/chats.service';

@Controller('/api/chats')
export class CancelController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async invoke(@Param('id') id: string): Promise<ChatWithProcessing> {
    return this.chatsService.cancel(id);
  }
}
