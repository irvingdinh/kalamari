import { useParams } from "react-router";

import { useWorkspaceAgents } from "@/modules/agent/hooks/use-workspace-agents";
import { AppLayout } from "@/modules/core/components/AppLayout";
import { ErrorIndicator } from "@/modules/core/components/ErrorIndicator";
import { LoadingIndicator } from "@/modules/core/components/LoadingIndicator";
import { useWorkspace } from "@/modules/workspace/hooks/use-workspace";

import { useTask } from "../../hooks/use-task";
import { TaskPageContent } from "./TaskPageContent";

export const TaskPage = () => {
  const { workspaceId, taskId } = useParams<{
    workspaceId: string;
    taskId: string;
  }>();

  const taskQuery = useTask(taskId!);
  const workspaceQuery = useWorkspace(workspaceId!);
  const agentsQuery = useWorkspaceAgents(workspaceId!);

  const queries = [taskQuery, workspaceQuery, agentsQuery];
  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const error = queries.find((q) => q.error)?.error;

  if (isLoading) {
    return (
      <LoadingIndicator
        pageTitle="Task"
        breadcrumbItems={[{ label: "Task" }]}
      />
    );
  }

  if (isError) {
    return (
      <ErrorIndicator
        pageTitle="Task"
        breadcrumbItems={[{ label: "Task" }]}
        title="Failed to Load Task"
        message={error?.message}
      />
    );
  }

  const task = taskQuery.data!;
  const workspace = workspaceQuery.data!;
  const agents = agentsQuery.data!;

  return (
    <AppLayout
      breadcrumbItems={[
        { label: "Workspaces", href: "/workspaces" },
        { label: workspace.name, href: `/workspaces/${workspace.id}` },
        { label: task.summary },
      ]}
      title={task.summary}
    >
      <TaskPageContent task={task} workspace={workspace} agents={agents} />
    </AppLayout>
  );
};
