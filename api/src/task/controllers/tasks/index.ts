import { taskCommentsControllers } from './comments';
import { DeleteController } from './delete.controller';
import { IndexController } from './index.controller';
import { ShowController } from './show.controller';
import { UpdateController } from './update.controller';

export const tasksControllers = [
  DeleteController,
  IndexController,
  ShowController,
  UpdateController,
  ...taskCommentsControllers,
];
