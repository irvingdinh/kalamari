import { RadioIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import { AppLayout } from "@/modules/core/components/AppLayout";
import { useSSE } from "@/modules/maintenance/hooks/use-sse";

export const EventsPage = () => {
  const { events, isConnected, clearEvents } = useSSE();

  return (
    <AppLayout className="flex justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">Events</h2>
            <span
              className={`inline-block size-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
              title={isConnected ? "Connected" : "Disconnected"}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearEvents}
              disabled={events.length === 0}
            >
              <Trash2Icon className="size-4" />
              Clear
            </Button>
          </div>
        </div>

        {events.length === 0 && (
          <div className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-center text-sm">
            <RadioIcon className="text-muted-foreground size-8" />
            <span>Waiting for events...</span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-muted/50 flex flex-col gap-1 rounded-md border p-3"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono font-medium">
                  {event.type}
                </span>
                <span className="text-muted-foreground">
                  {event.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <pre className="text-muted-foreground overflow-x-auto text-xs">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default EventsPage;
