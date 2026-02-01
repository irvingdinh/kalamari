import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WorkspaceResponseDto {
  @ApiProperty({
    description: 'Unique workspace identifier',
    example: 'abc123xyz',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the workspace',
    example: 'My Project',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the workspace',
    example: 'A project for building APIs',
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Working directory path for the workspace',
    example: '/Users/dev/projects/myapp',
    nullable: true,
  })
  workingDirectory: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
