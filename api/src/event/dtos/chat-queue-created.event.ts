export class ChatQueueCreatedEvent {
  constructor(
    public readonly chatId: string,
    public readonly queueId: string,
  ) {}
}
