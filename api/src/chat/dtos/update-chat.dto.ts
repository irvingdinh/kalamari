import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateChatDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}
