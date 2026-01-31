import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';

import { ChatsService } from '../../services/chats.service';

@Controller('/api/chats')
export class DeleteController {
  constructor(private readonly chatsService: ChatsService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async invoke(@Param('id') id: string): Promise<void> {
    return this.chatsService.remove(id);
  }
}
