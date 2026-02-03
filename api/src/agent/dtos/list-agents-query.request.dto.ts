import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListAgentsQueryRequestDto {
  @ApiPropertyOptional({
    description:
      'Filter agents by workspace ID. If not provided, returns agents from all workspaces.',
    example: 'ws_abc123',
  })
  @IsOptional()
  @IsString()
  workspace_id?: string;
}
