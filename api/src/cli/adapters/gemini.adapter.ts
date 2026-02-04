import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';

import { DirService } from '../../core/services/dir.service';
import { CliType } from '../types';
import { CliAdapter, ExecResult, ExecuteOptions } from './cli.adapter';

@Injectable()
export class GeminiAdapter extends CliAdapter {
  readonly type = CliType.Gemini;

  constructor(private readonly dirService: DirService) {
    super();
  }

  async ping(cwd?: string): Promise<ExecResult> {
    return this.exec({
      command: 'gemini',
      args: [
        '--model',
        'gemini-2.5-flash-lite',
        '--output-format',
        'stream-json',
      ],
      cwd: cwd ?? this.dirService.ensureTempDir(),
      stdin: 'Please say "PONG", thanks',
    });
  }

  async version(cwd?: string): Promise<ExecResult> {
    return this.exec({
      command: 'gemini',
      args: ['--version'],
      cwd: cwd ?? this.dirService.ensureTempDir(),
    });
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
        command: 'gemini',
        args: ['--yolo', '--output-format', 'stream-json'],
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
