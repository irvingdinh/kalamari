import { LoaderIcon } from "lucide-react";

import { AppLayout } from "@/modules/core/components/AppLayout";
import type { BreadcrumbItemType } from "@/modules/core/components/AppLayout/types";

interface LoadingIndicatorProps {
  pageTitle?: string;
  breadcrumbItems?: BreadcrumbItemType[];
}

export const LoadingIndicator = ({
  pageTitle,
  breadcrumbItems,
}: LoadingIndicatorProps) => {
  return (
    <AppLayout
      breadcrumbItems={breadcrumbItems}
      title={pageTitle}
      className="flex justify-center p-4"
    >
      <div className="flex w-full justify-center py-8">
        <LoaderIcon className="size-5 animate-spin" />
      </div>
    </AppLayout>
  );
};
