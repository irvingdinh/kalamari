import { Injectable } from '@nestjs/common';
import { createWriteStream, WriteStream } from 'fs';

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
    const { stdin, cwd, logFilePath } = options;

    let logStream: WriteStream | undefined;
    if (logFilePath) {
      logStream = createWriteStream(logFilePath, { flags: 'w' });
    }

    const onOutput = (chunk: string) => {
      if (logStream) {
        logStream.write(chunk);
      }
    };

    try {
      const result = await this.exec({
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
        onStdout: onOutput,
        onStderr: onOutput,
      });
      return result;
    } finally {
      if (logStream) {
        logStream.end();
      }
    }
  }
}
