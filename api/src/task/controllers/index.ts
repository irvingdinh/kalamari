import { taskCommentsControllers } from './task-comments';
import { tasksControllers } from './tasks';
import { workspacesControllers } from './workspaces';

export const controllers = [
  ...tasksControllers,
  ...taskCommentsControllers,
  ...workspacesControllers,
];
