import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspaceAgents } from "@/modules/agent/hooks/use-workspace-agents";
import { AppLayout } from "@/modules/core/components/AppLayout";
import { PageBreadcrumb } from "@/modules/core/components/PageBreadcrumb";

import { useCreateChat } from "../../hooks/use-create-chat";
import type { CliType } from "../../types";

interface FormValues {
  name: string;
  agentId: string;
  cliType: string;
}

const CLI_TYPES = [
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
  { value: "codex", label: "Codex" },
];

const NONE_VALUE = "__none__";

export const CreateChatPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const createChat = useCreateChat();
  const { data: agents } = useWorkspaceAgents(workspaceId!);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      agentId: NONE_VALUE,
      cliType: NONE_VALUE,
    },
  });

  const onSubmit = (data: FormValues) => {
    createChat.mutate(
      {
        workspaceId: workspaceId!,
        name: data.name || undefined,
        agentId: data.agentId !== NONE_VALUE ? data.agentId : undefined,
        cliType:
          data.cliType !== NONE_VALUE ? (data.cliType as CliType) : undefined,
      },
      {
        onSuccess: (chat) =>
          navigate(`/workspaces/${workspaceId}/chats/${chat.id}`),
      },
    );
  };

  return (
    <AppLayout className="flex justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <PageBreadcrumb
          workspaceId={workspaceId!}
          segments={[
            {
              label: "Chats",
              href: `/workspaces/${workspaceId}/chats`,
            },
            { label: "Create" },
          ]}
        />

        <h2 className="text-lg font-medium">Create Chat</h2>

        {createChat.isError && (
          <div className="text-destructive text-sm">
            Failed to create chat: {createChat.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Untitled chat"
              aria-invalid={!!errors.name}
              {...register("name", {
                maxLength: {
                  value: 255,
                  message: "Name must be at most 255 characters",
                },
              })}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="agentId">Agent (optional)</Label>
            <Controller
              name="agentId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="agentId">
                    <SelectValue placeholder="No agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>None</SelectItem>
                    {agents?.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="cliType">CLI Type (optional override)</Label>
            <Controller
              name="cliType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="cliType">
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>Default</SelectItem>
                    {CLI_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || createChat.isPending}
            >
              {createChat.isPending ? "Creating..." : "Create"}
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/workspaces/${workspaceId}/chats`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
