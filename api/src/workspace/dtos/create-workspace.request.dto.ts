import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWorkspaceRequestDto {
  @ApiProperty({
    description: 'Name of the workspace',
    maxLength: 255,
    example: 'My New Project',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Optional description of the workspace',
    maxLength: 1000,
    example: 'A workspace for developing the API backend',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Working directory path for AI agents to operate in',
    maxLength: 255,
    example: '/Users/dev/projects/myapp',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  workingDirectory?: string;
}
