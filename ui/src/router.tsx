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
    path: "/workspaces/:workspaceId",
    lazy: lazy(() => import("@/modules/workspace/pages/WorkspacePage")),
  },
  {
    path: "/workspaces/:workspaceId/edit",
    lazy: lazy(() => import("@/modules/workspace/pages/EditWorkspacePage")),
  },
  {
    path: "/workspaces/create",
    lazy: lazy(() => import("@/modules/workspace/pages/CreateWorkspacePage")),
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
    path: "*",
    lazy: lazy(() => import("@/modules/core/pages/NotFoundPage")),
  },
]);
