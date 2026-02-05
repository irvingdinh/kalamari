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
          <p className="text-muted-foreground mt-1">No agents configured.</p>
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
  );
};
