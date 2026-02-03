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
    path: "*",
    lazy: lazy(() => import("@/modules/core/pages/NotFoundPage")),
  },
]);
