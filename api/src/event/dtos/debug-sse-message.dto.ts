export interface DebugSseMessagePayload {
  source: string;
  sourceId: string;
  stream: string;
  chunk: string;
}

export interface DebugSseMessageDto {
  type: string;
  payload: DebugSseMessagePayload;
}
