import {
  LoaderIcon,
  SendIcon,
  SettingsIcon,
  SquareIcon,
  TrashIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Markdown } from "@/components/ui/markdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspaceAgents } from "@/modules/agent/hooks/use-workspace-agents";
import { AppLayout } from "@/modules/core/components/AppLayout";
import { PageBreadcrumb } from "@/modules/core/components/PageBreadcrumb";

import { useCancelChat } from "../../hooks/use-cancel-chat";
import { useChat } from "../../hooks/use-chat";
import { useChatMessages } from "../../hooks/use-chat-messages";
import { useDeleteChat } from "../../hooks/use-delete-chat";
import { useSendMessage } from "../../hooks/use-send-message";
import { useUpdateChat } from "../../hooks/use-update-chat";
import type { Chat, ChatMessage, CliType } from "../../types";

const ACTOR_LABELS: Record<string, string> = {
  user: "You",
  agent: "Agent",
  system: "System",
};

const CLI_TYPES = [
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
  { value: "codex", label: "Codex" },
];

const NONE_VALUE = "__none__";

interface MessageFormValues {
  text: string;
}

interface EditFormValues {
  name: string;
  agentId: string;
  cliType: string;
}

const ChatSettings = ({
  chat,
  workspaceId,
  open,
  onOpenChange,
}: {
  chat: Chat;
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const updateChat = useUpdateChat();
  const { data: agents } = useWorkspaceAgents(workspaceId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditFormValues>({
    defaultValues: {
      name: chat.name,
      agentId: chat.agentId ?? NONE_VALUE,
      cliType: chat.cliType ?? NONE_VALUE,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: chat.name,
        agentId: chat.agentId ?? NONE_VALUE,
        cliType: chat.cliType ?? NONE_VALUE,
      });
    }
  }, [open, chat, reset]);

  const onSubmit = (data: EditFormValues) => {
    updateChat.mutate(
      {
        chatId: chat.id,
        name: data.name || undefined,
        agentId: data.agentId !== NONE_VALUE ? data.agentId : null,
        cliType: data.cliType !== NONE_VALUE ? (data.cliType as CliType) : null,
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Chat Settings</SheetTitle>
          <SheetDescription>
            Update the chat name, linked agent, or CLI type.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 px-4"
        >
          {updateChat.isError && (
            <div className="text-destructive text-sm">
              Failed to update chat: {updateChat.error.message}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              placeholder="Untitled chat"
              aria-invalid={!!errors.name}
              {...register("name", {
                maxLength: {
                  value: 255,
                  message: "Name must be at most 255 characters",
                },
              })}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-agentId">Agent</Label>
            <Controller
              name="agentId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="edit-agentId">
                    <SelectValue placeholder="No agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>None</SelectItem>
                    {agents?.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-cliType">CLI Type</Label>
            <Controller
              name="cliType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="edit-cliType">
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>Default</SelectItem>
                    {CLI_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={updateChat.isPending}>
              {updateChat.isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

const ChatDetails = ({
  chat,
  workspaceId,
}: {
  chat: Chat;
  workspaceId: string;
}) => {
  const navigate = useNavigate();
  const deleteChat = useDeleteChat();
  const cancelChat = useCancelChat();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleDelete = () => {
    deleteChat.mutate(chat.id, {
      onSuccess: () => navigate(`/workspaces/${workspaceId}/chats`),
      onSettled: () => setShowDeleteDialog(false),
    });
  };

  const handleCancel = () => {
    cancelChat.mutate(chat.id);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-medium">{chat.name}</h2>
          <div className="flex gap-1">
            {chat.isProcessing && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleCancel}
                disabled={cancelChat.isPending}
                title="Cancel processing"
              >
                <SquareIcon className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowSettings(true)}
              title="Chat settings"
            >
              <SettingsIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowDeleteDialog(true)}
            >
              <TrashIcon className="size-4" />
            </Button>
          </div>
        </div>

        {cancelChat.isError && (
          <div className="text-destructive text-sm">
            Failed to cancel: {cancelChat.error.message}
          </div>
        )}

        <div className="text-muted-foreground flex gap-4 text-xs">
          {chat.isProcessing && (
            <span className="flex items-center gap-1">
              <LoaderIcon className="size-3 animate-spin" />
              Processing
            </span>
          )}
          {chat.cliType && <span>CLI: {chat.cliType}</span>}
          <span>Created {new Date(chat.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <ChatSettings
        chat={chat}
        workspaceId={workspaceId}
        open={showSettings}
        onOpenChange={setShowSettings}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be
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
    </>
  );
};

const MessageItem = ({
  message,
  resolveAgentName,
}: {
  message: ChatMessage;
  resolveAgentName: (actorId: string | null) => string | undefined;
}) => {
  const isUser = message.actorType === "user";
  const isSystem = message.actorType === "system";
  const isAgent = message.actorType === "agent";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-muted flex max-w-[85%] flex-col gap-1 rounded-md px-3 py-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground text-xs font-medium italic">
              System
            </span>
            <span className="text-muted-foreground text-xs">
              {new Date(message.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-muted-foreground text-sm whitespace-pre-wrap italic">
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  const actorLabel = isAgent
    ? (resolveAgentName(message.actorId) ?? "Agent")
    : (ACTOR_LABELS[message.actorType] ?? message.actorType);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[85%] flex-col gap-1 rounded-lg px-3 py-2 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium ${
              isUser ? "text-primary-foreground/80" : "text-muted-foreground"
            }`}
          >
            {actorLabel}
          </span>
          <span
            className={`text-xs ${
              isUser ? "text-primary-foreground/60" : "text-muted-foreground"
            }`}
          >
            {new Date(message.createdAt).toLocaleString()}
          </span>
        </div>
        {isAgent ? (
          <Markdown className="text-sm">{message.text}</Markdown>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        )}
      </div>
    </div>
  );
};

const MessagesSection = ({
  chatId,
  workspaceId,
  isProcessing,
}: {
  chatId: string;
  workspaceId: string;
  isProcessing: boolean;
}) => {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(chatId, { isProcessing });
  const { data: agents } = useWorkspaceAgents(workspaceId);
  const sendMessage = useSendMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageFormValues>({
    defaultValues: { text: "" },
  });

  // API returns messages DESC (newest first), reverse for chronological display
  const messages = useMemo(
    () => [...(data?.pages.flatMap((page) => page.data) ?? [])].reverse(),
    [data],
  );

  const agentMap = useMemo(() => {
    const map = new Map<string, string>();
    agents?.forEach((agent) => map.set(agent.id, agent.name));
    return map;
  }, [agents]);

  const resolveAgentName = useCallback(
    (actorId: string | null) => {
      if (!actorId) return undefined;
      return agentMap.get(actorId);
    },
    [agentMap],
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  const onSubmit = (formData: MessageFormValues) => {
    sendMessage.mutate(
      { chatId, text: formData.text },
      { onSuccess: () => reset() },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium">Messages</h3>

      {isLoading && (
        <div className="flex justify-center py-4">
          <LoaderIcon className="size-5 animate-spin" />
        </div>
      )}

      {isError && (
        <div className="text-destructive py-4 text-center text-sm">
          Failed to load messages: {error.message}
        </div>
      )}

      {!isLoading && !isError && messages.length === 0 && (
        <div className="text-muted-foreground py-4 text-center text-sm">
          No messages yet.
        </div>
      )}

      {messages.length > 0 && (
        <div className="flex flex-col gap-4">
          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading..." : "Load older messages"}
              </Button>
            </div>
          )}

          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              resolveAgentName={resolveAgentName}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center gap-2 px-1">
          <LoaderIcon className="text-muted-foreground size-3 animate-spin" />
          <span className="text-muted-foreground text-xs">
            Agent is responding...
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <Textarea
          placeholder="Type a message..."
          rows={3}
          aria-invalid={!!errors.text}
          {...register("text", { required: "Message text is required" })}
        />
        {errors.text && (
          <p className="text-destructive text-sm">{errors.text.message}</p>
        )}
        {sendMessage.isError && (
          <p className="text-destructive text-sm">
            {sendMessage.error.message}
          </p>
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={sendMessage.isPending || isProcessing}
          >
            <SendIcon className="size-4" />
            {sendMessage.isPending ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const ViewChatPage = () => {
  const { workspaceId, chatId } = useParams<{
    workspaceId: string;
    chatId: string;
  }>();
  const { data: chat, isLoading, isError, error } = useChat(chatId!);

  if (isLoading) {
    return (
      <AppLayout className="flex justify-center p-4">
        <div className="flex w-full max-w-3xl justify-center py-8">
          <LoaderIcon className="size-5 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout className="flex justify-center p-4">
        <div className="text-destructive flex w-full max-w-3xl justify-center py-8 text-sm">
          Failed to load chat: {error.message}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout className="flex justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <PageBreadcrumb
          workspaceId={workspaceId!}
          segments={[
            {
              label: "Chats",
              href: `/workspaces/${workspaceId}/chats`,
            },
            { label: chat!.name },
          ]}
        />

        <ChatDetails chat={chat!} workspaceId={workspaceId!} />

        <Separator />

        <MessagesSection
          chatId={chatId!}
          workspaceId={workspaceId!}
          isProcessing={chat!.isProcessing}
        />
      </div>
    </AppLayout>
  );
};
