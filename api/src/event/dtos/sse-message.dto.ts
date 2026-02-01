export interface SseMessagePayload {
  chatId: string;
  messageId?: string;
  queueId?: string;
}

export interface SseMessageDto {
  type: string;
  payload?: SseMessagePayload;
}
