import { tasksControllers } from './tasks';
import { workspacesControllers } from './workspaces';

export const controllers = [...tasksControllers, ...workspacesControllers];
