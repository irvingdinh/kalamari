import {
  CircleCheckIcon,
  CircleXIcon,
  LoaderIcon,
  RefreshCwIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item.tsx";
import { AppLayout } from "@/modules/core/components/AppLayout";
import { useHealth } from "@/modules/health/hooks/use-health";

export const HealthPage = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useHealth();

  const clis = data?.clis ?? [];

  return (
    <AppLayout className="flex justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-4">
        <div className="flex justify-between">
          <h2 className="text-lg font-medium">System Health</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCwIcon className="size-4" />
              Refresh
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <LoaderIcon className="size-5 animate-spin" />
          </div>
        )}

        {isError && (
          <div className="text-destructive py-8 text-center text-sm">
            Failed to load health status: {error.message}
          </div>
        )}

        {!isLoading && !isError && clis.length === 0 && (
          <div className="text-muted-foreground py-8 text-center text-sm">
            No CLI adapters configured.
          </div>
        )}

        {clis.length > 0 && (
          <div className="flex flex-col gap-2">
            {clis.map((cli) => (
              <Item variant="outline" key={cli.type}>
                <ItemContent>
                  <div className="flex items-center gap-2">
                    {cli.isReady ? (
                      <CircleCheckIcon className="size-4 shrink-0 text-green-600 dark:text-green-400" />
                    ) : (
                      <CircleXIcon className="text-destructive size-4 shrink-0" />
                    )}
                    <ItemTitle>{cli.type}</ItemTitle>
                  </div>
                  <ItemDescription>
                    {cli.isReady
                      ? cli.version
                        ? `Ready — ${cli.version}`
                        : "Ready"
                      : "Not available"}
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default HealthPage;
