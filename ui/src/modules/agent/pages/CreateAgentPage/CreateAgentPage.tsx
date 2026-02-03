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
import { Textarea } from "@/components/ui/textarea";
import { AppLayout } from "@/modules/core/components/AppLayout";

import { useCreateAgent } from "../../hooks/use-create-agent";

interface FormValues {
  name: string;
  description: string;
  instruction: string;
  cliType: string;
}

const CLI_TYPES = [
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
  { value: "codex", label: "Codex" },
];

export const CreateAgentPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const createAgent = useCreateAgent();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      instruction: "",
      cliType: "claude",
    },
  });

  const onSubmit = (data: FormValues) => {
    createAgent.mutate(
      {
        workspaceId: workspaceId!,
        name: data.name,
        description: data.description || undefined,
        instruction: data.instruction || undefined,
        cliType: data.cliType,
      },
      {
        onSuccess: () =>
          navigate(`/workspaces/${workspaceId}/agents`),
      },
    );
  };

  return (
    <AppLayout className="flex justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <h2 className="text-lg font-medium">Create Agent</h2>

        {createAgent.isError && (
          <div className="text-destructive text-sm">
            Failed to create agent: {createAgent.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
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
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="cliType">CLI Type</Label>
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
              <p className="text-destructive text-sm">
                {errors.cliType.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description"
              rows={3}
              aria-invalid={!!errors.description}
              {...register("description", {
                maxLength: {
                  value: 1000,
                  message: "Description must be at most 1000 characters",
                },
              })}
            />
            {errors.description && (
              <p className="text-destructive text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="instruction">Instruction</Label>
            <Textarea
              id="instruction"
              placeholder="Optional custom instruction for the agent"
              rows={5}
              aria-invalid={!!errors.instruction}
              {...register("instruction")}
            />
            {errors.instruction && (
              <p className="text-destructive text-sm">
                {errors.instruction.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || createAgent.isPending}
            >
              {createAgent.isPending ? "Creating..." : "Create"}
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/workspaces/${workspaceId}/agents`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
