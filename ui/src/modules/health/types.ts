export interface CliHealthStatus {
  type: string;
  isReady: boolean;
  version?: string;
}

export interface HealthResponse {
  clis: CliHealthStatus[];
}
