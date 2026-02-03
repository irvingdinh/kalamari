import { ChevronRightIcon, LoaderIcon, PlusIcon } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item.tsx";
import { AppLayout } from "@/modules/core/components/AppLayout";
import { useWorkspaces } from "@/modules/workspace/hooks/use-workspaces";

export const WorkspacesPage = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useWorkspaces();

  const workspaces = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <AppLayout className="flex justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-4">
        <div className="flex justify-between">
          <h2 className="text-lg font-medium">Workspaces</h2>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/workspaces/create">
                <PlusIcon className="size-4" />
                New
              </Link>
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
            Failed to load workspaces: {error.message}
          </div>
        )}

        {!isLoading && !isError && workspaces.length === 0 && (
          <div className="text-muted-foreground py-8 text-center text-sm">
            No workspaces yet.
          </div>
        )}

        {workspaces.length > 0 && (
          <div className="flex flex-col gap-2">
            {workspaces.map((workspace) => (
              <Item variant="outline" asChild key={workspace.id}>
                <Link to={`/workspaces/${workspace.id}`}>
                  <ItemContent>
                    <ItemTitle className="line-clamp-1">
                      {workspace.name}
                    </ItemTitle>
                    {workspace.description && (
                      <ItemDescription className="line-clamp-1">
                        {workspace.description}
                      </ItemDescription>
                    )}
                  </ItemContent>

                  <ItemActions>
                    <ChevronRightIcon className="size-4" />
                  </ItemActions>
                </Link>
              </Item>
            ))}
          </div>
        )}

        {hasNextPage && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
