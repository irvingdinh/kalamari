import React from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar.tsx";
import { AppHeader } from "@/modules/core/components/AppLayout/AppHeader.tsx";
import { AppSidebar } from "@/modules/core/components/AppLayout/AppSidebar.tsx";
import { AppSidebarRight } from "@/modules/core/components/AppLayout/AppSidebarRight.tsx";

type AppLayoutProps = React.ComponentProps<"div">;

export const AppLayout = ({ className, ...props }: AppLayoutProps) => {
  const { children, ...otherProps } = props;

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <AppHeader />

        <div className={className} {...otherProps}>
          {children}
        </div>
      </SidebarInset>

      <AppSidebarRight />
    </SidebarProvider>
  );
};
