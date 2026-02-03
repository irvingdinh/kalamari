import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskCommentRequestDto {
  @ApiProperty({
    description: 'Comment text content',
    example: 'I think we should approach this differently.',
  })
  @IsNotEmpty()
  @IsString()
  text: string;
}
