import { PlusCircleIcon } from "lucide-react";
import { Link } from "react-router";

import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { formatRelativeTime } from "@/lib/format-relative-time.ts";
import type { Chat } from "@/modules/chat/types.ts";

interface ChatsContentProps {
  chats: Chat[];
}

export const ChatsContent = ({ chats }: ChatsContentProps) => {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center">
        <h2 className="text-lg font-medium">Chats</h2>
        <div className="ml-auto">
          <Button variant="ghost" size="sm" asChild>
            <Link to="#">
              <PlusCircleIcon />
            </Link>
          </Button>
        </div>
      </div>

      <ScrollArea className="h-64">
        <div className="flex flex-col gap-2">
          {chats.length === 0 ? (
            <Alert>
              <AlertDescription>No chats yet.</AlertDescription>
            </Alert>
          ) : (
            chats.map((chat) => (
              <Item key={chat.id} variant="outline" size="sm" asChild>
                <Link to="#">
                  <ItemContent>
                    <ItemTitle>{chat.name}</ItemTitle>
                    <ItemDescription className="line-clamp-1">
                      {formatRelativeTime(chat.updatedAt)}
                      {chat.isProcessing && " · Processing..."}
                    </ItemDescription>
                  </ItemContent>
                </Link>
              </Item>
            ))
          )}
        </div>
      </ScrollArea>
    </section>
  );
};
