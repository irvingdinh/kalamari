import { useSyntaxHighlight } from "@/modules/core/hooks/use-syntax-highlight.ts";

interface CodeBlockProps {
  code: string;
  lang?: string;
}

export function CodeBlock({ code, lang }: CodeBlockProps) {
  const html = useSyntaxHighlight({ code, lang });

  return (
    <div
      className="[&_pre]:p-2 [&_pre]:text-xs"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
