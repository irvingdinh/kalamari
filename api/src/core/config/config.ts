import { homedir } from 'os';
import { join } from 'path';

import { CLI_TYPE_VALUES, CliType } from '../../cli/types';

export interface AppConfig {
  http: {
    host: string;
    port: number;
  };
  dir: {
    data: string;
  };
  processor: {
    disabled: boolean;
    defaultCli: CliType;
  };
}

export const config = (): { root: AppConfig } => ({
  root: {
    http: {
      host: process.env.HOST || '127.0.0.1',
      port: parseInt(process.env.PORT || '3456', 10),
    },
    dir: {
      data: getDataDir(),
    },
    processor: {
      disabled: process.env.KALAMARI_PROCESSOR_DISABLED === '1',
      defaultCli: getProcessorDefaultCli(),
    },
  },
});

const getProcessorDefaultCli = (): CliType => {
  const value = process.env.KALAMARI_PROCESSOR_DEFAULT_CLI;
  if (!value) return CliType.Claude;

  if (!CLI_TYPE_VALUES.includes(value as CliType)) {
    console.error(
      `Invalid KALAMARI_PROCESSOR_DEFAULT_CLI: "${value}". Must be one of: ${CLI_TYPE_VALUES.join(', ')}`,
    );
    process.exit(1);
  }

  return value as CliType;
};

const getDataDir = (): string => {
  if (process.env.KALAMARI_DATA_DIR) return process.env.KALAMARI_DATA_DIR;
  return join(homedir(), '.kalamari');
};
