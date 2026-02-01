import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateChatRequestDto {
  @ApiPropertyOptional({
    description: 'New name for the chat',
    maxLength: 255,
    example: 'API Design Discussion',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}
