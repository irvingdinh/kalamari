import {
  ArrowDownIcon,
  ArrowUpIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
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
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { useDeleteAgent } from "@/modules/agent/hooks/use-delete-agent.ts";
import { useReorderAgents } from "@/modules/agent/hooks/use-reorder-agents.ts";
import type { Agent } from "@/modules/agent/types.ts";

interface AgentsContentProps {
  workspaceId: string;
  agents: Agent[];
}

export const AgentsContent = ({ workspaceId, agents }: AgentsContentProps) => {
  const navigate = useNavigate();
  const deleteAgent = useDeleteAgent();
  const reorderAgents = useReorderAgents();

  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const ids = agents.map((a) => a.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    reorderAgents.mutate({ workspaceId, agentIds: ids });
  };

  const handleMoveDown = (index: number) => {
    if (index === agents.length - 1) return;
    const ids = agents.map((a) => a.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    reorderAgents.mutate({ workspaceId, agentIds: ids });
  };

  const handleDelete = () => {
    if (!agentToDelete) return;
    deleteAgent.mutate(agentToDelete.id, {
      onSettled: () => setAgentToDelete(null),
    });
  };

  return (
    <>
      <section className="flex flex-col gap-2">
        <div className="flex items-center">
          <h2 className="text-lg font-medium">Agents</h2>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/workspaces/${workspaceId}/agents/create`}>
                <PlusCircleIcon />
              </Link>
            </Button>
          </div>
        </div>

        <ScrollArea className="h-64">
          <div className="flex flex-col gap-2">
            {agents.length === 0 ? (
              <Alert>
                <AlertDescription>No agents configured.</AlertDescription>
              </Alert>
            ) : (
              agents.map((agent, index) => (
                <Item key={agent.id} variant="outline" size="sm">
                  <ItemContent>
                    <ItemTitle>{agent.name}</ItemTitle>
                    <ItemDescription className="line-clamp-1">
                      {agent.description}
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
              ))
            )}
          </div>
        </ScrollArea>
      </section>

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
    </>
  );
};
