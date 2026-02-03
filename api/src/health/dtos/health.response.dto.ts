import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CLI_TYPE_VALUES } from '../../cli/types';

export class CliHealthStatusResponseDto {
  @ApiProperty({
    description: 'CLI adapter type',
    example: 'claude',
    enum: CLI_TYPE_VALUES,
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

export class HealthResponseDto {
  @ApiProperty({
    description: 'Health status of all CLI adapters',
    type: [CliHealthStatusResponseDto],
  })
  clis: CliHealthStatusResponseDto[];
}
