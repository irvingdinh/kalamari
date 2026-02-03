export class TaskQueueCreatedEvent {
  constructor(
    public readonly taskId: string,
    public readonly queueId: string,
  ) {}
}
