import { RadioIcon, TrashIcon } from "lucide-react";
import React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.tsx";
import { useDebugSSE } from "@/modules/maintenance/hooks/use-debug-sse.ts";

export const AppSidebarRight = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const { events, isConnected, clearEvents } = useDebugSSE();

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex"
      {...props}
    >
      <SidebarContent className="overflow-y-auto p-2">
        <div className="flex items-center gap-2 px-1 pb-2">
          <span className="text-xs font-medium">Debug</span>
          <span
            className={`inline-block size-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
            title={isConnected ? "Connected" : "Disconnected"}
          />
        </div>

        {events.length === 0 && (
          <div className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-center text-xs">
            <RadioIcon className="text-muted-foreground size-6" />
            <span>Waiting for events...</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-muted/50 flex flex-col gap-1 rounded-md border p-2"
            >
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="bg-primary/10 text-primary rounded px-1 py-0.5 font-mono font-medium">
                  {event.type}
                </span>
                <span className="text-muted-foreground">
                  {event.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <pre className="text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all text-[10px] leading-tight">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={clearEvents}>
              <TrashIcon />
              <span>Clear</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
