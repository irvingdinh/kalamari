import {
  ActivityIcon,
  ChevronRightIcon,
  FolderIcon,
  LayoutDashboardIcon,
  ListTodoIcon,
  MessageSquareIcon,
  PlusIcon,
  RadioIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { Collapsible } from "radix-ui";
import React from "react";
import { Link, useLocation } from "react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar.tsx";
import { useWorkspaces } from "@/modules/workspace/hooks/use-workspaces.ts";
import type { Workspace } from "@/modules/workspace/types.ts";

function WorkspaceNavItem({ workspace }: { workspace: Workspace }) {
  const location = useLocation();
  const basePath = `/workspaces/${workspace.id}`;

  const isActive = location.pathname.startsWith(basePath);
  const isOverviewActive = location.pathname === basePath;
  const isSettingsActive = location.pathname.startsWith(
    `${basePath}/settings`,
  );
  const isAgentsActive = location.pathname.startsWith(`${basePath}/agents`);
  const isChatsActive = location.pathname.startsWith(`${basePath}/chats`);
  const isTasksActive = location.pathname.startsWith(`${basePath}/tasks`);

  return (
    <Collapsible.Root defaultOpen={isActive} asChild>
      <SidebarMenuItem>
        <Collapsible.Trigger asChild>
          <SidebarMenuButton tooltip={workspace.name} isActive={isActive}>
            <FolderIcon className="size-4" />
            <span>{workspace.name}</span>
            <ChevronRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </Collapsible.Trigger>

        <Collapsible.Content>
          <SidebarMenuSub>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton asChild isActive={isOverviewActive}>
                <Link to={basePath}>
                  <LayoutDashboardIcon className="size-4" />
                  <span>Overview</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>

            <SidebarMenuSubItem>
              <SidebarMenuSubButton asChild isActive={isAgentsActive}>
                <Link to={`${basePath}/agents`}>
                  <UsersIcon className="size-4" />
                  <span>Agents</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>

            <SidebarMenuSubItem>
              <SidebarMenuSubButton asChild isActive={isChatsActive}>
                <Link to={`${basePath}/chats`}>
                  <MessageSquareIcon className="size-4" />
                  <span>Chats</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>

            <SidebarMenuSubItem>
              <SidebarMenuSubButton asChild isActive={isTasksActive}>
                <Link to={`${basePath}/tasks`}>
                  <ListTodoIcon className="size-4" />
                  <span>Tasks</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>

            <SidebarMenuSubItem>
              <SidebarMenuSubButton asChild isActive={isSettingsActive}>
                <Link to={`${basePath}/settings`}>
                  <SettingsIcon className="size-4" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </Collapsible.Content>
      </SidebarMenuItem>
    </Collapsible.Root>
  );
}

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useWorkspaces(100);

  const workspaces = React.useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  React.useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup className="group/collapsible">
          <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
          <SidebarGroupAction asChild>
            <Link to="/workspaces/create" title="Create Workspace">
              <PlusIcon className="size-4" />
            </Link>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}

              {workspaces.map((workspace) => (
                <WorkspaceNavItem key={workspace.id} workspace={workspace} />
              ))}

              {!isLoading && workspaces.length === 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/workspaces/create">
                      <PlusIcon className="size-4" />
                      <span>Create workspace</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/health">
                    <ActivityIcon className="size-4" />
                    System Health
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/maintenance/events">
                    <RadioIcon className="size-4" />
                    Events
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="sm" asChild>
              <Link
                to="https://github.com/irvingdinh"
                target="_blank"
                className="text-muted-foreground justify-center"
              >
                A project of Irving Dinh
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
