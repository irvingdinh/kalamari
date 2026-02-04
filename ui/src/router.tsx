import type { ComponentType } from "react";
import { createBrowserRouter, redirect } from "react-router";

const lazy =
  (importFn: () => Promise<{ default: ComponentType }>) => async () => {
    const { default: Component } = await importFn();
    return { Component };
  };

export const router = createBrowserRouter([
  {
    path: "/",
    loader: () => redirect("/workspaces"),
  },
  {
    path: "/workspaces",
    lazy: lazy(() => import("@/modules/workspace/pages/WorkspacesPage")),
  },
  {
    path: "/workspaces/create",
    lazy: lazy(() => import("@/modules/workspace/pages/CreateWorkspacePage")),
  },
  {
    path: "/workspaces/:workspaceId",
    lazy: lazy(
      () => import("@/modules/workspace/pages/WorkspaceOverviewPage"),
    ),
  },
  {
    path: "/workspaces/:workspaceId/settings",
    lazy: lazy(() => import("@/modules/workspace/pages/EditWorkspacePage")),
  },
  {
    path: "/workspaces/:workspaceId/agents",
    lazy: lazy(() => import("@/modules/agent/pages/WorkspaceAgentsPage")),
  },
  {
    path: "/workspaces/:workspaceId/agents/create",
    lazy: lazy(() => import("@/modules/agent/pages/CreateAgentPage")),
  },
  {
    path: "/workspaces/:workspaceId/agents/:agentId",
    lazy: lazy(() => import("@/modules/agent/pages/EditAgentPage")),
  },
  {
    path: "/workspaces/:workspaceId/chats",
    lazy: lazy(() => import("@/modules/chat/pages/WorkspaceChatsPage")),
  },
  {
    path: "/workspaces/:workspaceId/chats/create",
    lazy: lazy(() => import("@/modules/chat/pages/CreateChatPage")),
  },
  {
    path: "/workspaces/:workspaceId/chats/:chatId",
    lazy: lazy(() => import("@/modules/chat/pages/ViewChatPage")),
  },
  {
    path: "/workspaces/:workspaceId/tasks",
    lazy: lazy(() => import("@/modules/task/pages/WorkspaceTasksPage")),
  },
  {
    path: "/workspaces/:workspaceId/tasks/create",
    lazy: lazy(() => import("@/modules/task/pages/CreateTaskPage")),
  },
  {
    path: "/workspaces/:workspaceId/tasks/:taskId",
    lazy: lazy(() => import("@/modules/task/pages/ViewTaskPage")),
  },
  {
    path: "/health",
    lazy: lazy(() => import("@/modules/health/pages/HealthPage")),
  },
  {
    path: "/maintenance/events",
    lazy: lazy(() => import("@/modules/maintenance/pages/EventsPage")),
  },
  {
    path: "*",
    lazy: lazy(() => import("@/modules/core/pages/NotFoundPage")),
  },
]);
