import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  PaginatedResponse,
  PaginationQueryRequestDto,
} from '../../../core/dtos';
import { PaginatedChatResponseDto } from '../../dtos';
import { ChatsService, ChatWithProcessing } from '../../services/chats.service';

@ApiTags('chats')
@Controller('/api/workspaces/:workspaceId/chats')
export class IndexController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  @ApiOperation({
    summary: 'List chats in a workspace',
    description:
      'Returns a paginated list of all chats in a workspace, ordered by last update',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID',
    example: 'ws_abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of chats',
    type: PaginatedChatResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async invoke(
    @Param('workspaceId') workspaceId: string,
    @Query() query: PaginationQueryRequestDto,
  ): Promise<PaginatedResponse<ChatWithProcessing>> {
    return this.chatsService.findAllByWorkspace(
      workspaceId,
      query.page,
      query.limit,
    );
  }
}
