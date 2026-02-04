import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';

import { DirService } from '../../core/services/dir.service';
import { CliType } from '../types';
import { CliAdapter, ExecResult, ExecuteOptions } from './cli.adapter';

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
        command: 'claude',
        args: [
          '--chrome',
          '--dangerously-skip-permissions',
          '--output-format',
          'stream-json',
          '--verbose',
          '--print',
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
