import { Injectable } from '@nestjs/common';
import { mkdirSync } from 'fs';
import { nanoid } from 'nanoid';
import { tmpdir } from 'os';
import { join } from 'path';

@Injectable()
export class DirService {
  /**
   * Creates a temporary directory for generic CLI operations (e.g., health checks,
   * capability probing). For specific scenarios like tasks or chats, use dedicated
   * directory methods instead.
   *
   * @returns The absolute path to the created directory (e.g., `/tmp/kalamari/abc123`)
   */
  ensureTempDir(): string {
    const dirPath = join(tmpdir(), 'kalamari', nanoid());
    mkdirSync(dirPath, { recursive: true });
    return dirPath;
  }
}

// TODO: Considering these dirs for later implementation.
// {tempdir}/kalamari/tasks__/{nanoid} — for actually working with the task
// {tempdir}/kalamari/tasks-manifest/{nanoid} — for the task input, output, etc.
// {tempdir}/kalamari/chats-manifest/{nanoid} — for the chat input, output, etc.
