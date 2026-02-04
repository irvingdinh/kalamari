import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

interface MarkdownProps {
  children: string;
  className?: string;
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none break-words",
        "prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5",
        "prose-pre:bg-muted prose-pre:rounded-md prose-pre:p-3",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-code:bg-muted prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-xs",
        "prose-a:text-primary prose-a:underline",
        className,
      )}
    >
      {children}
    </ReactMarkdown>
  );
}
