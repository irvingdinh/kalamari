import { ClaudeAdapter } from './claude.adapter';
import { CodexAdapter } from './codex.adapter';
import { GeminiAdapter } from './gemini.adapter';
import { OpencodeAdapter } from './opencode.adapter';

export { ClaudeAdapter } from './claude.adapter';
export type {
  CliHealthStatus,
  ExecOptions,
  ExecResult,
  ExecuteOptions,
} from './cli.adapter';
export { CliAdapter } from './cli.adapter';
export { CodexAdapter } from './codex.adapter';
export { GeminiAdapter } from './gemini.adapter';
export { OpencodeAdapter } from './opencode.adapter';

export const adapters = [
  ClaudeAdapter,
  CodexAdapter,
  GeminiAdapter,
  OpencodeAdapter,
];
