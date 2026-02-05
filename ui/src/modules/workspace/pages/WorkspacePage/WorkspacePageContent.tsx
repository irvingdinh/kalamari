import { Link } from "react-router";

import { Button } from "@/components/ui/button.tsx";
import type { Agent } from "@/modules/agent/types.ts";
import type { Workspace } from "@/modules/workspace/types.ts";

interface WorkspaceContentProps {
  workspace: Workspace;
  agents: Agent[];
}

export const WorkspacePageContent = ({
  workspace,
  agents,
}: WorkspaceContentProps) => {
  return (
    <div>
      <div className="flex w-full items-center justify-start border-b p-4">
        <div>
          <h2 className="text-lg font-bold">{workspace.name}</h2>
          <div className="max-w-lg">
            <p className="text-muted-foreground line-clamp-1 text-sm">
              {workspace.description}
            </p>
          </div>
        </div>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/workspaces/${workspace.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="text-lg font-semibold">About</h2>
            <p className="text-muted-foreground mt-1">
              {workspace.description || "No description provided."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Agents</h2>
            {agents.length === 0 ? (
              <p className="text-muted-foreground mt-1">
                No agents configured.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {agents.map((agent) => (
                  <li
                    key={agent.id}
                    className="bg-muted/50 rounded-md border px-4 py-3"
                  >
                    <div className="font-medium">{agent.name}</div>
                    {agent.description && (
                      <div className="text-muted-foreground text-sm">
                        {agent.description}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
