import { AlertCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldSet } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import { useCreateTaskComment } from "../hooks/use-create-task-comment";

interface FormValues {
  text: string;
}

interface AddCommentFormProps {
  taskId: string;
}

export const AddCommentForm = ({ taskId }: AddCommentFormProps) => {
  const createComment = useCreateTaskComment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      text: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    await createComment.mutateAsync({
      taskId,
      text: data.text,
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldSet disabled={createComment.isPending}>
        <FieldGroup>
          {createComment.isError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertDescription>{createComment.error.message}</AlertDescription>
            </Alert>
          )}

          <Field>
            <Textarea
              placeholder="Add a comment..."
              aria-invalid={!!errors.text}
              className="min-h-20"
              {...register("text", {
                required: "Comment text is required",
              })}
            />
            {errors.text && <FieldError>{errors.text.message}</FieldError>}
          </Field>

          <Field>
            <div className="flex justify-end">
              <Button type="submit" size="sm">
                {createComment.isPending ? "Adding..." : "Add Comment"}
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
};
