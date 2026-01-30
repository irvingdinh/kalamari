import { Injectable } from '@nestjs/common';

import { CliType } from '../types';
import { CliAdapter, ExecResult } from './cli.adapter';

@Injectable()
export class OpencodeAdapter extends CliAdapter {
  readonly type = CliType.Opencode;

  async ping(): Promise<ExecResult> {
    return this.exec({
      command: 'opencode',
      args: ['run'],
      stdin: 'Please say "PONG", thanks',
    });
  }

  async version(): Promise<ExecResult> {
    return this.exec({
      command: 'opencode',
      args: ['--version'],
    });
  }
}
