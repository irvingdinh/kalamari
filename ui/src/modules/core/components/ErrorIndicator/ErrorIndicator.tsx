import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppLayout } from "@/modules/core/components/AppLayout";
import type { BreadcrumbItemType } from "@/modules/core/components/AppLayout/types";

interface ErrorIndicatorProps {
  pageTitle?: string;
  breadcrumbItems?: BreadcrumbItemType[];
  title: string;
  message?: string;
}

export const ErrorIndicator = ({
  pageTitle,
  breadcrumbItems,
  title,
  message,
}: ErrorIndicatorProps) => {
  return (
    <AppLayout
      breadcrumbItems={breadcrumbItems}
      title={pageTitle}
      className="flex justify-center p-4"
    >
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>{title}</AlertTitle>
          {message && <AlertDescription>{message}</AlertDescription>}
        </Alert>
      </div>
    </AppLayout>
  );
};
