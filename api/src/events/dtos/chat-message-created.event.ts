export class ChatMessageCreatedEvent {
  constructor(
    public readonly chatId: string,
    public readonly messageId: string,
  ) {}
}
