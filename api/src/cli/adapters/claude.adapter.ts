import { Injectable } from '@nestjs/common';

import { DirService } from '../../core/services/dir.service';
import { CliType } from '../types';
import { CliAdapter, ExecResult } from './cli.adapter';

@Injectable()
export class ClaudeAdapter extends CliAdapter {
  readonly type = CliType.Claude;

  constructor(private readonly dirService: DirService) {
    super();
  }

  async ping(cwd?: string): Promise<ExecResult> {
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
      cwd: cwd ?? this.dirService.ensureTempDir(),
      stdin: 'Please say "PONG", thanks',
    });
  }

  async version(cwd?: string): Promise<ExecResult> {
    const result = await this.exec({
      command: 'claude',
      args: ['--version'],
      cwd: cwd ?? this.dirService.ensureTempDir(),
    });

    return {
      ...result,
      stdout: result.stdout.replace('(Claude Code)', '').trim(),
    };
  }
}
