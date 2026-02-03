import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTaskRequestDto {
  @ApiProperty({
    description: 'Short summary of the task',
    maxLength: 255,
    example: 'Fix login page styling',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  summary: string;

  @ApiProperty({
    description: 'Detailed description of the task',
    example: 'The login button is misaligned on mobile viewports.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}
