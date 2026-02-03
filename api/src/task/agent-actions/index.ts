import { AgentCommentActionHandler } from './agent-comment.action';
import { OrchestratorChangeStatusActionHandler } from './orchestrator-change-status.action';
import { OrchestratorCommentActionHandler } from './orchestrator-comment.action';
import { OrchestratorTriggerAgentActionHandler } from './orchestrator-trigger-agent.action';

export const taskAgentActions = [
  AgentCommentActionHandler,
  OrchestratorChangeStatusActionHandler,
  OrchestratorCommentActionHandler,
  OrchestratorTriggerAgentActionHandler,
];
