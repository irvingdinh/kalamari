import { Injectable } from '@nestjs/common';

import { CliType } from '../types';
import { CliAdapter, ExecResult } from './cli.adapter';

@Injectable()
export class CodexAdapter extends CliAdapter {
  readonly type = CliType.Codex;

  async ping(): Promise<ExecResult> {
    return this.exec({
      command: 'codex',
      args: ['--model', 'gpt-5.1-codex-mini', 'exec'],
      stdin: 'Please say "PONG", thanks',
    });
  }

  async version(): Promise<ExecResult> {
    const result = await this.exec({
      command: 'codex',
      args: ['--version'],
    });

    return {
      ...result,
      stdout: result.stdout.replace('codex-cli', '').trim(),
    };
  }
}
