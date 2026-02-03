export class TaskCommentCreatedEvent {
  constructor(
    public readonly taskId: string,
    public readonly commentId: string,
  ) {}
}
