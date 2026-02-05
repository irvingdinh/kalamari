import { useParams } from "react-router";

import { useWorkspaceAgents } from "@/modules/agent/hooks/use-workspace-agents";
import { useWorkspaceChats } from "@/modules/chat/hooks/use-workspace-chats";
import { AppLayout } from "@/modules/core/components/AppLayout";
import { ErrorIndicator } from "@/modules/core/components/ErrorIndicator";
import { LoadingIndicator } from "@/modules/core/components/LoadingIndicator";
import { WorkspacePageContent } from "@/modules/workspace/pages/WorkspacePage/WorkspacePageContent.tsx";

import { useWorkspace } from "../../hooks/use-workspace";

export const WorkspacePage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const workspaceQuery = useWorkspace(workspaceId!);
  const agentsQuery = useWorkspaceAgents(workspaceId!);
  const chatsQuery = useWorkspaceChats(workspaceId!);

  const isLoading =
    workspaceQuery.isLoading || agentsQuery.isLoading || chatsQuery.isLoading;
  const isError =
    workspaceQuery.isError || agentsQuery.isError || chatsQuery.isError;
  const error = workspaceQuery.error || agentsQuery.error || chatsQuery.error;

  if (isLoading) {
    return (
      <LoadingIndicator
        pageTitle="Workspace"
        breadcrumbItems={[{ label: "Workspace" }]}
      />
    );
  }

  if (isError) {
    return (
      <ErrorIndicator
        pageTitle="Workspace"
        breadcrumbItems={[{ label: "Workspace" }]}
        title="Failed to Load Workspace"
        message={error?.message}
      />
    );
  }

  const workspace = workspaceQuery.data!;
  const agents = agentsQuery.data!;
  const chats = chatsQuery.data!;

  return (
    <AppLayout
      breadcrumbItems={[
        { label: "Workspaces", href: "/workspaces" },
        { label: workspace.name },
      ]}
      title={workspace.name}
    >
      <WorkspacePageContent
        workspace={workspace}
        agents={agents}
        chats={chats}
      />
    </AppLayout>
  );
};
