import {
  ChevronRightIcon,
  FolderIcon,
  ListTodoIcon,
  LoaderIcon,
  MessageSquareIcon,
  PlusIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { Link, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { useWorkspaceAgents } from "@/modules/agent/hooks/use-workspace-agents";
import type { Agent } from "@/modules/agent/types";
import { useChats } from "@/modules/chat/hooks/use-chats";
import type { Chat } from "@/modules/chat/types";
import { AppLayout } from "@/modules/core/components/AppLayout";
import { PageBreadcrumb } from "@/modules/core/components/PageBreadcrumb";
import { useTasks } from "@/modules/task/hooks/use-tasks";
import type { Task } from "@/modules/task/types";

import { useWorkspace } from "../../hooks/use-workspace";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WorkspaceDetails({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const { data: workspace, isLoading } = useWorkspace(workspaceId);

  if (isLoading || !workspace) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="bg-muted flex size-10 items-center justify-center rounded-md">
          <FolderIcon className="size-5" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg font-medium">{workspace.name}</h2>
          {workspace.description && (
            <p className="text-muted-foreground text-sm">
              {workspace.description}
            </p>
          )}
        </div>
      </div>
      {workspace.workingDirectory && (
        <p className="text-muted-foreground text-xs font-mono">
          {workspace.workingDirectory}
        </p>
      )}
    </div>
  );
}

function AgentsSection({ workspaceId }: { workspaceId: string }) {
  const { data: agents, isLoading } = useWorkspaceAgents(workspaceId);

  const agentCount = agents?.length ?? 0;
  const recentAgents = agents?.slice(0, 3) ?? [];

  return (
    <SummarySection
      icon={<UsersIcon className="size-4" />}
      title="Agents"
      count={agentCount}
      isLoading={isLoading}
      href={`/workspaces/${workspaceId}/agents`}
      createHref={`/workspaces/${workspaceId}/agents/create`}
      emptyText="No agents configured yet."
    >
      {recentAgents.map((agent: Agent) => (
        <Item key={agent.id} variant="muted" size="sm">
          <Link
            to={`/workspaces/${workspaceId}/agents/${agent.id}`}
            className="flex min-w-0 flex-1 items-center gap-2"
          >
            <ItemContent>
              <ItemTitle className="line-clamp-1">{agent.name}</ItemTitle>
              <ItemDescription className="line-clamp-1">
                {agent.cliType}
                {agent.description ? ` \u00b7 ${agent.description}` : ""}
              </ItemDescription>
            </ItemContent>
            <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" />
          </Link>
        </Item>
      ))}
    </SummarySection>
  );
}

function ChatsSection({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = useChats({ workspaceId, limit: 3 });

  const total = data?.pages[0]?.meta.total ?? 0;
  const recentChats = data?.pages[0]?.data ?? [];

  return (
    <SummarySection
      icon={<MessageSquareIcon className="size-4" />}
      title="Chats"
      count={total}
      isLoading={isLoading}
      href={`/workspaces/${workspaceId}/chats`}
      createHref={`/workspaces/${workspaceId}/chats/create`}
      emptyText="No chats yet."
    >
      {recentChats.map((chat: Chat) => (
        <Item key={chat.id} variant="muted" size="sm">
          <Link
            to={`/workspaces/${workspaceId}/chats/${chat.id}`}
            className="flex min-w-0 flex-1 items-center gap-2"
          >
            <ItemContent>
              <ItemTitle className="line-clamp-1">{chat.name}</ItemTitle>
              <ItemDescription className="line-clamp-1">
                {chat.isProcessing ? "Processing..." : formatDate(chat.updatedAt)}
                {chat.cliType ? ` \u00b7 ${chat.cliType}` : ""}
              </ItemDescription>
            </ItemContent>
            <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" />
          </Link>
        </Item>
      ))}
    </SummarySection>
  );
}

function TasksSection({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = useTasks({ workspaceId, limit: 3 });

  const total = data?.pages[0]?.meta.total ?? 0;
  const recentTasks = data?.pages[0]?.data ?? [];

  const statusLabel: Record<string, string> = {
    backlog: "Backlog",
    in_progress: "In Progress",
    wait_for_review: "Review",
    completed: "Completed",
  };

  return (
    <SummarySection
      icon={<ListTodoIcon className="size-4" />}
      title="Tasks"
      count={total}
      isLoading={isLoading}
      href={`/workspaces/${workspaceId}/tasks`}
      createHref={`/workspaces/${workspaceId}/tasks/create`}
      emptyText="No tasks yet."
    >
      {recentTasks.map((task: Task) => (
        <Item key={task.id} variant="muted" size="sm">
          <Link
            to={`/workspaces/${workspaceId}/tasks/${task.id}`}
            className="flex min-w-0 flex-1 items-center gap-2"
          >
            <ItemContent>
              <ItemTitle className="line-clamp-1">{task.summary}</ItemTitle>
              <ItemDescription className="line-clamp-1">
                {statusLabel[task.status] ?? task.status}
                {" \u00b7 "}
                {formatDate(task.lastActivityAt)}
              </ItemDescription>
            </ItemContent>
            <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" />
          </Link>
        </Item>
      ))}
    </SummarySection>
  );
}

function SummarySection({
  icon,
  title,
  count,
  isLoading,
  href,
  createHref,
  emptyText,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  isLoading: boolean;
  href: string;
  createHref: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link to={href} className="flex items-center gap-2 hover:underline">
          {icon}
          <span className="text-sm font-medium">{title}</span>
          {!isLoading && (
            <span className="text-muted-foreground text-xs">({count})</span>
          )}
        </Link>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-xs" asChild>
            <Link to={createHref}>
              <PlusIcon className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon-xs" asChild>
            <Link to={href}>
              <ChevronRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <LoaderIcon className="size-4 animate-spin" />
        </div>
      )}

      {!isLoading && count === 0 && (
        <p className="text-muted-foreground py-2 text-center text-sm">
          {emptyText}
        </p>
      )}

      {!isLoading && count > 0 && (
        <div className="flex flex-col gap-1">{children}</div>
      )}
    </div>
  );
}

export const WorkspaceOverviewPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { isLoading, isError, error } = useWorkspace(workspaceId!);

  if (isLoading) {
    return (
      <AppLayout className="flex justify-center p-4">
        <div className="flex w-full max-w-3xl justify-center py-8">
          <LoaderIcon className="size-5 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout className="flex justify-center p-4">
        <div className="text-destructive flex w-full max-w-3xl justify-center py-8 text-sm">
          Failed to load workspace: {error.message}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout className="flex justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <PageBreadcrumb
          workspaceId={workspaceId!}
          segments={[{ label: "Overview" }]}
        />

        <div className="flex items-start justify-between">
          <WorkspaceDetails workspaceId={workspaceId!} />
          <Button variant="outline" size="sm" asChild>
            <Link to={`/workspaces/${workspaceId!}/settings`}>
              <SettingsIcon className="size-4" />
              Settings
            </Link>
          </Button>
        </div>

        <div className="border-t" />

        <AgentsSection workspaceId={workspaceId!} />

        <div className="border-t" />

        <ChatsSection workspaceId={workspaceId!} />

        <div className="border-t" />

        <TasksSection workspaceId={workspaceId!} />
      </div>
    </AppLayout>
  );
};

export default WorkspaceOverviewPage;
