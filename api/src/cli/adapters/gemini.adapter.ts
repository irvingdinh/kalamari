import { Injectable } from '@nestjs/common';

import { CliType } from '../types';
import { CliAdapter, ExecResult } from './cli.adapter';

@Injectable()
export class GeminiAdapter extends CliAdapter {
  readonly type = CliType.Gemini;

  async ping(): Promise<ExecResult> {
    return this.exec({
      command: 'gemini',
      args: [
        '--model',
        'gemini-2.5-flash-lite',
        '--output-format',
        'stream-json',
      ],
      stdin: 'Please say "PONG", thanks',
    });
  }

  async version(): Promise<ExecResult> {
    return this.exec({
      command: 'gemini',
      args: ['--version'],
    });
  }
}
