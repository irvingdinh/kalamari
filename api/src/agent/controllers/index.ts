import { agentsControllers } from './agents';
import { workspacesControllers } from './workspaces';

export const controllers = [...agentsControllers, ...workspacesControllers];
