import { BotIcon, CctvIcon, UserIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";
import { Spinner } from "@/components/ui/spinner";
import { formatRelativeTime } from "@/lib/format-relative-time.ts";
import type { Agent } from "@/modules/agent/types";
import { CodeBlock } from "@/modules/core/components/CodeBlock";

import { type TaskComment, TaskCommentActorType } from "../types";

interface TaskCommentsListProps {
  comments: TaskComment[];
  agents: Agent[];
  isLoading?: boolean;
}

function getActorName(
  actorType: TaskComment["actorType"],
  actorId: string | null,
  agents: Agent[],
): string {
  if (actorType === TaskCommentActorType.USER) {
    return "User";
  }
  if (actorType === TaskCommentActorType.SYSTEM) {
    return "System";
  }
  if (actorType === TaskCommentActorType.AGENT) {
    const agent = agents.find((a) => a.id === actorId);
    return agent?.name ?? "Deleted Agent";
  }
  return "Unknown";
}

function getActorIcon(actorType: TaskComment["actorType"]) {
  switch (actorType) {
    case TaskCommentActorType.USER:
      return <UserIcon className="size-4" />;
    case TaskCommentActorType.AGENT:
      return <BotIcon className="size-4" />;
    case TaskCommentActorType.SYSTEM:
      return <CctvIcon className="size-4" />;
    default:
      return <UserIcon className="size-4" />;
  }
}

export const TaskCommentsList = ({
  comments,
  agents,
  isLoading,
}: TaskCommentsListProps) => {
  if (isLoading && comments.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <Alert>
        <AlertDescription>No comments yet.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {comments.map((comment) => (
        <div key={comment.id} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div>
              <Avatar>
                <AvatarFallback>
                  {getActorIcon(comment.actorType)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div>
              <p className="text-sm font-medium">
                {getActorName(comment.actorType, comment.actorId, agents)}
              </p>
              <p className="text-muted-foreground text-xs">
                {formatRelativeTime(comment.createdAt)}
              </p>
            </div>
          </div>

          <CodeBlock code={comment.text} />
        </div>
      ))}
    </div>
  );
};
