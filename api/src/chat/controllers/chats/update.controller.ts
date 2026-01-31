import { Body, Controller, Param, Patch } from '@nestjs/common';

import { UpdateChatDto } from '../../dtos';
import { ChatsService, ChatWithProcessing } from '../../services/chats.service';

@Controller('/api/chats')
export class UpdateController {
  constructor(private readonly chatsService: ChatsService) {}

  @Patch(':id')
  async invoke(
    @Param('id') id: string,
    @Body() dto: UpdateChatDto,
  ): Promise<ChatWithProcessing> {
    return this.chatsService.update(id, dto);
  }
}
