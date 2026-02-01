export interface AgentAction {
  action: string;
}

export interface MessageAction extends AgentAction {
  action: 'message';
  text: string;
}

export type SupportedAgentAction = MessageAction;

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface ActionContext {
  chatId: string;
  queueId: string;
}

export interface AgentActionHandler<T extends AgentAction = AgentAction> {
  readonly actionType: string;
  execute(action: T, context: ActionContext): Promise<ActionResult>;
}
