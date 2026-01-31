import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdirSync } from 'fs';
import { nanoid } from 'nanoid';
import { tmpdir } from 'os';
import { join } from 'path';

import { AppConfig } from '../config/config';

@Injectable()
export class DirService {
  private readonly config: AppConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<AppConfig>('root')!;
  }

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

  /**
   * Ensures the application data directory exists, creating it if necessary.
   *
   * @returns The absolute path to the data directory (e.g., `~/.kalamari`)
   */
  ensureDataDir(): string {
    mkdirSync(this.config.dir.data, { recursive: true });
    return this.config.dir.data;
  }

  /**
   * Ensures the SQLite database file exists, creating it if necessary.
   *
   * @returns The absolute path to the database file (e.g., `~/.kalamari/kalamari.db`)
   */
  ensureDatabase(): string {
    return join(this.ensureDataDir(), 'kalamari.db');
  }
}

// TODO: Considering these dirs for later implementation.
// {tempdir}/kalamari/tasks__/{nanoid} — for actually working with the task
// {tempdir}/kalamari/tasks-manifest/{nanoid} — for the task input, output, etc.
// {tempdir}/kalamari/chats-manifest/{nanoid} — for the chat input, output, etc.
