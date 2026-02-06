import { useChats } from "@/modules/chat/hooks/use-chats.ts";
import { useTasks } from "@/modules/task/hooks/use-tasks.ts";

import { QuickAccessContent } from "./QuickAccessContent.tsx";

export const QuickAccess = () => {
  const { data: tasks } = useTasks();
  const { data: chats } = useChats();

  return <QuickAccessContent tasks={tasks ?? []} chats={chats ?? []} />;
};
