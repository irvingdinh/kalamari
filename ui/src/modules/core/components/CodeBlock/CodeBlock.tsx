import { useSyntaxHighlight } from "@/modules/core/hooks/use-syntax-highlight.ts";

interface CodeBlockProps {
  code: string;
  lang?: string;
}

export function CodeBlock({ code, lang }: CodeBlockProps) {
  const html = useSyntaxHighlight({ code, lang });

  return (
    <div
      className="[&_pre]:rounded [&_pre]:p-2 [&_pre]:text-xs [&_pre]:whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
