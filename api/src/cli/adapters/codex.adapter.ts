import { Injectable } from '@nestjs/common';

import { DirService } from '../../core/services/dir.service';
import { CliType } from '../types';
import { CliAdapter, ExecResult } from './cli.adapter';

@Injectable()
export class CodexAdapter extends CliAdapter {
  readonly type = CliType.Codex;

  constructor(private readonly dirService: DirService) {
    super();
  }

  async ping(cwd?: string): Promise<ExecResult> {
    return this.exec({
      command: 'codex',
      args: ['--model', 'gpt-5-nano', 'exec', '--skip-git-repo-check'],
      cwd: cwd ?? this.dirService.ensureTempDir(),
      stdin: 'Please say "PONG", thanks',
    });
  }

  async version(cwd?: string): Promise<ExecResult> {
    const result = await this.exec({
      command: 'codex',
      args: ['--version'],
      cwd: cwd ?? this.dirService.ensureTempDir(),
    });

    return {
      ...result,
      stdout: result.stdout.replace('codex-cli', '').trim(),
    };
  }
}
