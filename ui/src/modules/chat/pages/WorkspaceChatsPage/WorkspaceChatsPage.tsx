import {
  ChevronRightIcon,
  EllipsisVerticalIcon,
  LoaderIcon,
  PlusIcon,
  SquareIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item.tsx";
import { AppLayout } from "@/modules/core/components/AppLayout";
import { PageBreadcrumb } from "@/modules/core/components/PageBreadcrumb";

import { useCancelChat } from "../../hooks/use-cancel-chat";
import { useChats } from "../../hooks/use-chats";
import { useDeleteChat } from "../../hooks/use-delete-chat";
import type { Chat } from "../../types";

export const WorkspaceChatsPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChats({ workspaceId: workspaceId! });
  const deleteChat = useDeleteChat();
  const cancelChat = useCancelChat();

  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);

  const chats = data?.pages.flatMap((page) => page.data) ?? [];

  const handleDelete = () => {
    if (!chatToDelete) return;
    deleteChat.mutate(chatToDelete.id, {
      onSettled: () => setChatToDelete(null),
    });
  };

  return (
    <AppLayout className="flex justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-4">
        <PageBreadcrumb
          workspaceId={workspaceId!}
          segments={[{ label: "Chats" }]}
        />

        <div className="flex justify-between">
          <h2 className="text-lg font-medium">Chats</h2>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/workspaces/${workspaceId}/chats/create`}>
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
            Failed to load chats: {error.message}
          </div>
        )}

        {cancelChat.isError && (
          <div className="text-destructive text-sm">
            Failed to cancel chat: {cancelChat.error.message}
          </div>
        )}

        {!isLoading && !isError && chats.length === 0 && (
          <div className="text-muted-foreground py-8 text-center text-sm">
            No chats yet.
          </div>
        )}

        {chats.length > 0 && (
          <div className="flex flex-col gap-2">
            {chats.map((chat) => (
              <Item variant="outline" key={chat.id}>
                <Link
                  to={`/workspaces/${workspaceId}/chats/${chat.id}`}
                  className="flex min-w-0 flex-1 items-center gap-2"
                >
                  <ItemContent>
                    <ItemTitle className="line-clamp-1">{chat.name}</ItemTitle>
                    <ItemDescription className="line-clamp-1">
                      {chat.isProcessing ? "Processing..." : "Idle"}
                      {chat.cliType && ` — ${chat.cliType}`}
                    </ItemDescription>
                  </ItemContent>
                </Link>

                <ItemActions>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs">
                        <EllipsisVerticalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          to={`/workspaces/${workspaceId}/chats/${chat.id}`}
                        >
                          <ChevronRightIcon className="size-4" />
                          Open
                        </Link>
                      </DropdownMenuItem>

                      {chat.isProcessing && (
                        <DropdownMenuItem
                          onClick={() => cancelChat.mutate(chat.id)}
                        >
                          <SquareIcon className="size-4" />
                          Cancel Processing
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setChatToDelete(chat)}
                      >
                        <TrashIcon className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ItemActions>
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

      <AlertDialog
        open={!!chatToDelete}
        onOpenChange={(open) => {
          if (!open) setChatToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{chatToDelete?.name}"? All
              messages will be permanently deleted. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteChat.isPending}
            >
              {deleteChat.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};
