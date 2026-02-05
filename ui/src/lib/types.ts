export const CLI_TYPES = [
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
  { value: "codex", label: "Codex" },
] as const;

export type CliType = (typeof CLI_TYPES)[number]["value"];
