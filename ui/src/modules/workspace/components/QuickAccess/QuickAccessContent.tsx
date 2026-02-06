import { Link } from "react-router";

import { Badge } from "@/components/ui/badge.tsx";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import type { Chat } from "@/modules/chat/types";
import { TaskStatusBadge } from "@/modules/task/components/TaskStatusBadge.tsx";
import type { Task } from "@/modules/task/types";

interface QuickAccessContentProps {
  tasks: Task[];
  chats: Chat[];
}

export const QuickAccessContent = ({
  tasks,
  chats,
}: QuickAccessContentProps) => {
  return (
    <Tabs defaultValue="tasks">
      <SidebarGroup>
        <TabsList className="w-full">
          <TabsTrigger value="tasks" className="flex-1">
            Tasks
          </TabsTrigger>
          <TabsTrigger value="chats" className="flex-1">
            Chats
          </TabsTrigger>
        </TabsList>
      </SidebarGroup>

      <TabsContent value="tasks">
        <SidebarGroup>
          <SidebarMenu>
            {tasks.map((task) => (
              <SidebarMenuItem key={task.id}>
                <SidebarMenuButton className="h-auto" asChild>
                  <Link to={`/workspaces/${task.workspaceId}/tasks/${task.id}`}>
                    <div className="flex flex-col gap-0.5 py-0.5">
                      <span className="line-clamp-1 text-sm font-medium">
                        {task.summary}
                      </span>
                      <span className="text-muted-foreground line-clamp-1 flex items-center gap-1 text-xs">
                        <TaskStatusBadge status={task.status} />
                        {task.workspace?.name}
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </TabsContent>

      <TabsContent value="chats">
        <SidebarGroup>
          <SidebarMenu>
            {chats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton className="h-auto" asChild>
                  <Link to="#">
                    <div className="flex flex-col gap-0.5 py-0.5">
                      <span className="line-clamp-1 font-medium">
                        {chat.name}
                      </span>
                      <span className="text-muted-foreground line-clamp-1 flex items-center gap-1 text-xs">
                        {chat.isProcessing && (
                          <Badge className="bg-blue-50 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            <Spinner className="size-3" />
                            Processing
                          </Badge>
                        )}
                        {chat.workspace?.name}
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </TabsContent>
    </Tabs>
  );
};
