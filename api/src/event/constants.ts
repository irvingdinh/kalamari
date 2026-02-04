export const ChatEvents = {
  MESSAGE_CREATED: 'chat.message.created',
  QUEUE_CREATED: 'chat.queue.created',
} as const;

export const TaskEvents = {
  QUEUE_CREATED: 'task.queue.created',
} as const;

export const DebugEvents = {
  CLI_OUTPUT: 'debug.cli.output',
} as const;
