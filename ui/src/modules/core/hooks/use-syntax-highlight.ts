import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

import { useTheme } from "@/hooks/use-theme";

interface UseSyntaxHighlightOptions {
  code: string;
  lang?: string;
}

export function useSyntaxHighlight({
  code,
  lang = "markdown",
}: UseSyntaxHighlightOptions) {
  const { theme } = useTheme();
  const [html, setHtml] = useState<string>(`<pre>${code}</pre>`);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    let cancelled = false;

    codeToHtml(code, {
      lang,
      theme: isDark ? "vitesse-dark" : "vitesse-light",
    }).then((result) => {
      if (!cancelled) setHtml(result);
    });

    return () => {
      cancelled = true;
    };
  }, [code, lang, isDark]);

  return html;
}
