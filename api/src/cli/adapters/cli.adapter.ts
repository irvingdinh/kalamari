import { spawn } from 'child_process';

import { CliType } from '../types';

export interface ExecOptions {
  command: string;
  args: string[];
  stdin?: string;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface CliHealthStatus {
  type: CliType;
  isReady: boolean;
  version?: string;
}

export abstract class CliAdapter {
  abstract readonly type: CliType;

  abstract ping(): Promise<ExecResult>;
  abstract version(): Promise<ExecResult>;

  protected async exec(options: ExecOptions): Promise<ExecResult> {
    const { command, args, stdin, onStdout, onStderr } = options;

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let exitCode = 1;

      try {
        const child = spawn(command, args);

        child.stdout.on('data', (data: Buffer) => {
          const chunk = data.toString();
          stdout += chunk;
          onStdout?.(chunk);
        });

        child.stderr.on('data', (data: Buffer) => {
          const chunk = data.toString();
          stderr += chunk;
          onStderr?.(chunk);
        });

        child.on('close', (code) => {
          exitCode = code ?? 1;
          resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode });
        });

        child.on('error', (err) => {
          stderr += err.message;
          resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode });
        });

        if (stdin) {
          child.stdin.write(stdin);
          child.stdin.end();
        }
      } catch (err) {
        stderr += err instanceof Error ? err.message : String(err);
        resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode });
      }
    });
  }

  async getHealth(): Promise<CliHealthStatus> {
    const [pingResult, versionResult] = await Promise.all([
      this.ping(),
      this.version(),
    ]);

    return {
      type: this.type,
      isReady: pingResult.exitCode === 0,
      version: versionResult.exitCode === 0 ? versionResult.stdout : undefined,
    };
  }
}
