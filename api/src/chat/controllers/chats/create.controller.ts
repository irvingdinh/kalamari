import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ChatWithProcessingResponse } from '../../../core/responses';
import { ChatsService, ChatWithProcessing } from '../../services/chats.service';

@ApiTags('chats')
@Controller('/api/workspaces/:workspaceId/chats')
export class CreateController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new chat',
    description: 'Creates a new chat session in the specified workspace',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID',
    example: 'ws_abc123',
  })
  @ApiResponse({
    status: 201,
    description: 'Chat created successfully',
    type: ChatWithProcessingResponse,
  })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async invoke(
    @Param('workspaceId') workspaceId: string,
  ): Promise<ChatWithProcessing> {
    return this.chatsService.create(workspaceId);
  }
}
