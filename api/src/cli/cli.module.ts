import { Module } from '@nestjs/common';

import { CoreModule } from '../core/core.module';
import {
  adapters,
  ClaudeAdapter,
  CodexAdapter,
  GeminiAdapter,
  OpencodeAdapter,
} from './adapters';
import { services } from './services';
import { CLI_ADAPTERS } from './services/cli-registry.service';

@Module({
  imports: [CoreModule],
  providers: [
    ...adapters,
    ...services,
    {
      provide: CLI_ADAPTERS,
      useFactory: (
        claude: ClaudeAdapter,
        codex: CodexAdapter,
        gemini: GeminiAdapter,
        opencode: OpencodeAdapter,
      ) => [claude, codex, gemini, opencode],
      inject: [ClaudeAdapter, CodexAdapter, GeminiAdapter, OpencodeAdapter],
    },
  ],
  exports: [...services],
})
export class CliModule {}
