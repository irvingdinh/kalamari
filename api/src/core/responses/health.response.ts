import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CliHealthStatusResponse {
  @ApiProperty({
    description: 'CLI adapter type',
    example: 'claude',
    enum: ['claude', 'codex', 'gemini', 'opencode'],
  })
  type: string;

  @ApiProperty({
    description: 'Whether the CLI is ready and available',
    example: true,
  })
  isReady: boolean;

  @ApiPropertyOptional({
    description: 'CLI version if available',
    example: '1.0.0',
  })
  version?: string;
}

export class HealthResponse {
  @ApiProperty({
    description: 'Health status of all CLI adapters',
    type: [CliHealthStatusResponse],
  })
  clis: CliHealthStatusResponse[];
}
