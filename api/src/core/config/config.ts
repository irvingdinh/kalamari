export interface AppConfig {
  http: {
    host: string;
    port: number;
  };
}

export const config = (): { root: AppConfig } => ({
  root: {
    http: {
      host: process.env.HOST || '127.0.0.1',
      port: parseInt(process.env.PORT || '3456', 10),
    },
  },
});
