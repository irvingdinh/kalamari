import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateWorkspaceDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;
}
