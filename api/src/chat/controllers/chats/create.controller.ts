import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';

import { ChatsService, ChatWithProcessing } from '../../services/chats.service';

@Controller('/api/workspaces/:workspaceId/chats')
export class CreateController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async invoke(
    @Param('workspaceId') workspaceId: string,
  ): Promise<ChatWithProcessing> {
    return this.chatsService.create(workspaceId);
  }
}
