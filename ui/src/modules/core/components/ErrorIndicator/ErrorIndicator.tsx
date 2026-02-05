import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorIndicatorProps {
  title: string;
  message?: string;
}

export const ErrorIndicator = ({ title, message }: ErrorIndicatorProps) => {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{title}</AlertTitle>
      {message && <AlertDescription>{message}</AlertDescription>}
    </Alert>
  );
};
