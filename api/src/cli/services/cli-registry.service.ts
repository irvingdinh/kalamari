import { Inject, Injectable } from '@nestjs/common';

import { CliAdapter } from '../adapters';
import { CliType } from '../types';

export const CLI_ADAPTERS = 'CLI_ADAPTERS';

@Injectable()
export class CliRegistryService {
  constructor(@Inject(CLI_ADAPTERS) private readonly adapters: CliAdapter[]) {}

  getAll(): CliAdapter[] {
    return this.adapters;
  }

  getByType(type: CliType): CliAdapter | undefined {
    return this.adapters.find((adapter) => adapter.type === type);
  }
}
