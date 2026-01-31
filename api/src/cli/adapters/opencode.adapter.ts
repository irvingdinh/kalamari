import { Injectable } from '@nestjs/common';

import { DirService } from '../../core/services/dir.service';
import { CliType } from '../types';
import { CliAdapter, ExecResult } from './cli.adapter';

@Injectable()
export class OpencodeAdapter extends CliAdapter {
  readonly type = CliType.Opencode;

  constructor(private readonly dirService: DirService) {
    super();
  }

  async ping(cwd?: string): Promise<ExecResult> {
    return this.exec({
      command: 'opencode',
      args: ['run'],
      cwd: cwd ?? this.dirService.ensureTempDir(),
      stdin: 'Please say "PONG", thanks',
    });
  }

  async version(cwd?: string): Promise<ExecResult> {
    return this.exec({
      command: 'opencode',
      args: ['--version'],
      cwd: cwd ?? this.dirService.ensureTempDir(),
    });
  }
}
