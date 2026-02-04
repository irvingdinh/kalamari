import React, { useEffect } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar.tsx";
import { pageTitle } from "@/lib/utils.ts";
import { AppHeader } from "@/modules/core/components/AppLayout/AppHeader.tsx";
import { AppSidebar } from "@/modules/core/components/AppLayout/AppSidebar.tsx";
import type { BreadcrumbItemType } from "@/modules/core/components/AppLayout/types.ts";

interface AppLayoutProps extends React.ComponentProps<"div"> {
  breadcrumbItems?: BreadcrumbItemType[];
  title?: string;
}

export const AppLayout = ({
  breadcrumbItems,
  title,
  className,
  ...props
}: AppLayoutProps) => {
  const { children, ...otherProps } = props;

  useEffect(() => {
    if (title) document.title = pageTitle(title);
  }, [title]);

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <AppHeader breadcrumbItems={breadcrumbItems} />

        <div className={className} {...otherProps}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
