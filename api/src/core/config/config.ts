import { homedir } from 'os';
import { join } from 'path';

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
    },
  },
});

const getDataDir = (): string => {
  if (process.env.KALAMARI_DATA_DIR) return process.env.KALAMARI_DATA_DIR;
  return join(homedir(), '.kalamari');
};
