import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ReorderAgentsRequestDto {
  @ApiProperty({
    description:
      'Array of agent IDs in desired order. Must include all agents in the workspace.',
    example: ['abc123', 'def456', 'ghi789'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  agentIds: string[];
}
