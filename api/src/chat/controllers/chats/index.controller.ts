import { Controller, Get, Param, Query } from '@nestjs/common';

import { PaginatedResponse, PaginationQueryDto } from '../../../core/dtos';
import { ChatsService, ChatWithProcessing } from '../../services/chats.service';

@Controller('/api/workspaces/:workspaceId/chats')
export class IndexController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  async invoke(
    @Param('workspaceId') workspaceId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<ChatWithProcessing>> {
    return this.chatsService.findAllByWorkspace(
      workspaceId,
      query.page,
      query.limit,
    );
  }
}
