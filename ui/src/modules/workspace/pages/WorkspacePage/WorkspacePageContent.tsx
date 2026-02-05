import { Link } from "react-router";

import { Button } from "@/components/ui/button.tsx";
import type { Agent } from "@/modules/agent/types.ts";
import type { Chat } from "@/modules/chat/types.ts";
import type { Task } from "@/modules/task/types.ts";
import type { Workspace } from "@/modules/workspace/types.ts";

import { AgentsContent } from "./AgentsContent.tsx";
import { ChatsContent } from "./ChatsContent.tsx";
import { TasksContent } from "./TasksContent.tsx";

interface WorkspaceContentProps {
  workspace: Workspace;
  agents: Agent[];
  chats: Chat[];
  tasks: Task[];
}

export const WorkspacePageContent = ({
  workspace,
  agents,
  chats,
  tasks,
}: WorkspaceContentProps) => {
  return (
    <div>
      <div className="flex w-full items-center justify-start border-b p-4">
        <div>
          <h2 className="text-lg font-bold">{workspace.name}</h2>
          <div className="max-w-lg">
            <p className="text-muted-foreground line-clamp-1 text-sm">
              {workspace.description}
            </p>
          </div>
        </div>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/workspaces/${workspace.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AgentsContent workspaceId={workspace.id} agents={agents} />
            <ChatsContent chats={chats} />
          </div>

          <TasksContent workspaceId={workspace.id} tasks={tasks} />
        </div>
      </div>
    </div>
  );
};
