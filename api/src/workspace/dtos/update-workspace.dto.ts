import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateWorkspaceDto {
  @ApiPropertyOptional({
    description: 'New name for the workspace',
    maxLength: 255,
    example: 'Updated Project Name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'New description for the workspace',
    maxLength: 1000,
    example: 'Updated description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'New working directory path',
    maxLength: 255,
    example: '/Users/dev/projects/newpath',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  workingDirectory?: string;
}
