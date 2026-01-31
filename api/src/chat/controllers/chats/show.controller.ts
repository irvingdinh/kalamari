import { Controller, Get, Param } from '@nestjs/common';

import { ChatsService, ChatWithProcessing } from '../../services/chats.service';

@Controller('/api/chats')
export class ShowController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get(':id')
  async invoke(@Param('id') id: string): Promise<ChatWithProcessing> {
    return this.chatsService.findOne(id);
  }
}
