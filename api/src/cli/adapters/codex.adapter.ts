import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';

import { DirService } from '../../core/services/dir.service';
import { CliType } from '../types';
import { CliAdapter, ExecResult, ExecuteOptions } from './cli.adapter';

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

  async execute(options: ExecuteOptions): Promise<ExecResult> {
    const { stdin, cwd, logFilePath, onStdout, onStderr } = options;

    const logFileStream = logFilePath
      ? createWriteStream(logFilePath, { flags: 'w' })
      : undefined;

    const onStdoutChunk = (chunk: string) => {
      if (logFileStream) logFileStream.write(chunk);
      onStdout?.(chunk);
    };

    const onStderrChunk = (chunk: string) => {
      if (logFileStream) logFileStream.write(chunk);
      onStderr?.(chunk);
    };

    try {
      return await this.exec({
        command: 'codex',
        args: [
          'exec',
          '--dangerously-bypass-approvals-and-sandbox',
          '--json',
          '--skip-git-repo-check',
        ],
        cwd,
        stdin,
        onStdout: onStdoutChunk,
        onStderr: onStderrChunk,
      });
    } finally {
      if (logFileStream) logFileStream.end();
    }
  }
}
