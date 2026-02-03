import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskCommentRequestDto {
  @ApiProperty({
    description: 'Comment text',
    example: 'This task needs more details.',
  })
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  text: string;
}
