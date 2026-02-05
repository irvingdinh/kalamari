import {
  ArrowDownIcon,
  ArrowUpIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item.tsx";
import { useDeleteAgent } from "@/modules/agent/hooks/use-delete-agent";
import { useReorderAgents } from "@/modules/agent/hooks/use-reorder-agents";
import { useWorkspaceAgents } from "@/modules/agent/hooks/use-workspace-agents";
import type { Agent } from "@/modules/agent/types";
import { AppLayout } from "@/modules/core/components/AppLayout";
import { ErrorIndicator } from "@/modules/core/components/ErrorIndicator";
import { LoadingIndicator } from "@/modules/core/components/LoadingIndicator";

export const WorkspaceAgentsPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const {
    data: agents,
    isLoading,
    isError,
    error,
  } = useWorkspaceAgents(workspaceId!);
  const deleteAgent = useDeleteAgent();
  const reorderAgents = useReorderAgents();

  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  const handleMoveUp = (index: number) => {
    if (!agents || index === 0) return;
    const ids = agents.map((a) => a.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    reorderAgents.mutate({ workspaceId: workspaceId!, agentIds: ids });
  };

  const handleMoveDown = (index: number) => {
    if (!agents || index === agents.length - 1) return;
    const ids = agents.map((a) => a.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    reorderAgents.mutate({ workspaceId: workspaceId!, agentIds: ids });
  };

  const handleDelete = () => {
    if (!agentToDelete) return;
    deleteAgent.mutate(agentToDelete.id, {
      onSettled: () => setAgentToDelete(null),
    });
  };

  return (
    <AppLayout className="flex justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-4">
        <div className="flex justify-between">
          <h2 className="text-lg font-medium">Agents</h2>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/workspaces/${workspaceId}/agents/create`}>
                <PlusIcon className="size-4" />
                New
              </Link>
            </Button>
          </div>
        </div>

        {isLoading && <LoadingIndicator />}

        {isError && (
          <ErrorIndicator
            title="Failed to Load Agents"
            message={error.message}
          />
        )}

        {!isLoading && !isError && agents?.length === 0 && (
          <div className="text-muted-foreground py-8 text-center text-sm">
            No agents yet.
          </div>
        )}

        {agents && agents.length > 0 && (
          <div className="flex flex-col gap-2">
            {agents.map((agent, index) => (
              <Item variant="outline" key={agent.id}>
                <ItemContent>
                  <ItemTitle className="line-clamp-1">{agent.name}</ItemTitle>
                  <ItemDescription className="line-clamp-1">
                    {agent.cliType}
                    {agent.description && ` — ${agent.description}`}
                  </ItemDescription>
                </ItemContent>

                <ItemActions>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs">
                        <EllipsisVerticalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(
                            `/workspaces/${workspaceId}/agents/${agent.id}`,
                          )
                        }
                      >
                        <PencilIcon className="size-4" />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                      >
                        <ArrowUpIcon className="size-4" />
                        Move Up
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        disabled={index === agents.length - 1}
                        onClick={() => handleMoveDown(index)}
                      >
                        <ArrowDownIcon className="size-4" />
                        Move Down
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setAgentToDelete(agent)}
                      >
                        <TrashIcon className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ItemActions>
              </Item>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!agentToDelete}
        onOpenChange={(open) => {
          if (!open) setAgentToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{agentToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteAgent.isPending}
            >
              {deleteAgent.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};
