import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChatMessageRequestDto {
  @ApiProperty({
    description: 'Message text content to send to the AI agent',
    example: 'Can you help me refactor this function to be more efficient?',
  })
  @IsNotEmpty()
  @IsString()
  text: string;
}
