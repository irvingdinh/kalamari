import { AlertCircleIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CLI_TYPES } from "@/lib/types";
import { AppLayout } from "@/modules/core/components/AppLayout";
import { ErrorIndicator } from "@/modules/core/components/ErrorIndicator";
import { LoadingIndicator } from "@/modules/core/components/LoadingIndicator";
import { useWorkspace } from "@/modules/workspace/hooks/use-workspace";

import { useAgent } from "../../hooks/use-agent";
import { useUpdateAgent } from "../../hooks/use-update-agent";
import type { Agent } from "../../types";

interface FormValues {
  name: string;
  description: string;
  instruction: string;
  cliType: string;
}

const EditAgentForm = ({
  agent,
  workspaceId,
}: {
  agent: Agent;
  workspaceId: string;
}) => {
  const navigate = useNavigate();
  const updateAgent = useUpdateAgent();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: agent.name,
      description: agent.description ?? "",
      instruction: agent.instruction ?? "",
      cliType: agent.cliType,
    },
  });

  const onSubmit = async (data: FormValues) => {
    await updateAgent.mutateAsync({
      agentId: agent.id,
      name: data.name,
      description: data.description || undefined,
      instruction: data.instruction || undefined,
      cliType: data.cliType,
    });

    navigate(`/workspaces/${workspaceId}/agents`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldSet disabled={updateAgent.isPending}>
        <FieldGroup>
          {updateAgent.isError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Update Agent Failed</AlertTitle>
              <AlertDescription>{updateAgent.error.message}</AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              placeholder="Code Review Assistant"
              aria-invalid={!!errors.name}
              {...register("name", {
                required: "Name is required",
                maxLength: {
                  value: 255,
                  message: "Name must be at most 255 characters",
                },
              })}
            />
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="cliType">CLI Type</FieldLabel>
            <Controller
              name="cliType"
              control={control}
              rules={{ required: "CLI type is required" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="cliType" aria-invalid={!!errors.cliType}>
                    <SelectValue placeholder="Select CLI type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLI_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.cliType && (
              <FieldError>{errors.cliType.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              placeholder="Reviews pull requests for code quality and security best practices"
              aria-invalid={!!errors.description}
              className="h-24 overflow-y-auto"
              {...register("description", {
                maxLength: {
                  value: 1000,
                  message: "Description must be at most 1000 characters",
                },
              })}
            />
            {errors.description && (
              <FieldError>{errors.description.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="instruction">System Instruction</FieldLabel>
            <Textarea
              id="instruction"
              placeholder="You are a senior code reviewer. Focus on security vulnerabilities, performance issues, and adherence to the project's coding standards."
              aria-invalid={!!errors.instruction}
              className="h-24 overflow-y-auto"
              {...register("instruction")}
            />
            <FieldDescription>
              Defines the agent's role, expertise, and behavior. This
              instruction is included in every prompt sent to the CLI during
              chats and tasks.
            </FieldDescription>
            {errors.instruction && (
              <FieldError>{errors.instruction.message}</FieldError>
            )}
          </Field>

          <Field>
            <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground w-full sm:w-auto"
                onClick={() => navigate(`/workspaces/${workspaceId}/agents`)}
              >
                Cancel
              </Button>

              <Button type="submit" className="w-full sm:w-auto">
                {updateAgent.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
};

export const EditAgentPage = () => {
  const { workspaceId, agentId } = useParams<{
    workspaceId: string;
    agentId: string;
  }>();
  const { data: workspace } = useWorkspace(workspaceId!);
  const { data: agent, isLoading, isError, error } = useAgent(agentId!);

  if (isLoading) {
    return (
      <AppLayout
        breadcrumbItems={[
          {
            label: workspace?.name ?? "Workspace",
            href: `/workspaces/${workspaceId}`,
          },
          { label: "Agents", href: `/workspaces/${workspaceId}/agents` },
          { label: "Edit Agent" },
        ]}
        title="Edit Agent"
        className="flex justify-center p-4"
      >
        <div className="flex w-full max-w-xl justify-center">
          <LoadingIndicator />
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout
        breadcrumbItems={[
          {
            label: workspace?.name ?? "Workspace",
            href: `/workspaces/${workspaceId}`,
          },
          { label: "Agents", href: `/workspaces/${workspaceId}/agents` },
          { label: "Edit Agent" },
        ]}
        title="Edit Agent"
        className="flex justify-center p-4"
      >
        <div className="flex w-full max-w-xl flex-col gap-6">
          <ErrorIndicator
            title="Failed to Load Agent"
            message={error.message}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      breadcrumbItems={[
        {
          label: workspace?.name ?? "Workspace",
          href: `/workspaces/${workspaceId}`,
        },
        { label: "Agents", href: `/workspaces/${workspaceId}/agents` },
        { label: agent!.name },
      ]}
      title={`${agent!.name} | Edit Agent`}
      className="flex justify-center p-4"
    >
      <div className="flex w-full max-w-xl flex-col gap-6">
        <EditAgentForm agent={agent!} workspaceId={workspaceId!} />
      </div>
    </AppLayout>
  );
};
