export interface TaskOrchestratorAction {
  action: string;
}

export interface OrchestratorCommentAction extends TaskOrchestratorAction {
  action: 'comment';
  text: string;
}

export interface OrchestratorChangeStatusAction extends TaskOrchestratorAction {
  action: 'change_status';
  status: string;
}

export interface OrchestratorTriggerAgentAction extends TaskOrchestratorAction {
  action: 'trigger_agent';
  agentId: string;
}

export type SupportedOrchestratorAction =
  | OrchestratorCommentAction
  | OrchestratorChangeStatusAction
  | OrchestratorTriggerAgentAction;

export interface TaskAgentAction {
  action: string;
}

export interface AgentCommentAction extends TaskAgentAction {
  action: 'comment';
  text: string;
}

export type SupportedAgentAction = AgentCommentAction;

export interface TaskActionResult {
  success: boolean;
  error?: string;
}

export interface TaskOrchestratorActionContext {
  taskId: string;
}

export interface TaskAgentActionContext {
  taskId: string;
  agentId: string;
}

export interface TaskOrchestratorActionHandler<
  T extends TaskOrchestratorAction = TaskOrchestratorAction,
> {
  readonly actionType: string;
  execute(
    action: T,
    context: TaskOrchestratorActionContext,
  ): Promise<TaskActionResult>;
}

export interface TaskAgentActionHandler<
  T extends TaskAgentAction = TaskAgentAction,
> {
  readonly actionType: string;
  execute(
    action: T,
    context: TaskAgentActionContext,
  ): Promise<TaskActionResult>;
}
