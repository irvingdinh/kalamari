import { Injectable } from '@nestjs/common';

import { CliType } from '../types';
import { CliAdapter, ExecResult } from './cli.adapter';

@Injectable()
export class ClaudeAdapter extends CliAdapter {
  readonly type = CliType.Claude;

  async ping(): Promise<ExecResult> {
    return this.exec({
      command: 'claude',
      args: [
        '--model',
        'haiku',
        '--verbose',
        '--output-format',
        'stream-json',
        '--print',
      ],
      stdin: 'Please say "PONG", thanks',
    });
  }

  async version(): Promise<ExecResult> {
    const result = await this.exec({
      command: 'claude',
      args: ['--version'],
    });

    return {
      ...result,
      stdout: result.stdout.replace('(Claude Code)', '').trim(),
    };
  }
}
