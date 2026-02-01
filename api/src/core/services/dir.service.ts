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

  /**
   * Ensures the chat context directory exists, creating it if necessary.
   *
   * @returns The absolute path to the context directory (e.g., `/tmp/kalamari/context/`)
   */
  ensureChatContextDir(): string {
    const dirPath = join(tmpdir(), 'kalamari', 'context');
    mkdirSync(dirPath, { recursive: true });
    return dirPath;
  }

  /**
   * Gets the path to a chat's context file.
   *
   * @param chatId - The chat ID
   * @returns The absolute path to the context file (e.g., `/tmp/kalamari/context/chat_{chatId}.json`)
   */
  getChatContextPath(chatId: string): string {
    return join(this.ensureChatContextDir(), `chat_${chatId}.json`);
  }

  /**
   * Gets the path to a chat's messages file.
   *
   * @param chatId - The chat ID
   * @returns The absolute path to the messages file (e.g., `/tmp/kalamari/context/chat_{chatId}_messages.jsonl`)
   */
  getChatMessagesPath(chatId: string): string {
    return join(this.ensureChatContextDir(), `chat_${chatId}_messages.jsonl`);
  }

  /**
   * Ensures the chat input directory exists, creating it if necessary.
   *
   * @returns The absolute path to the input directory (e.g., `/tmp/kalamari/input/`)
   */
  ensureChatInputDir(): string {
    const dirPath = join(tmpdir(), 'kalamari', 'input');
    mkdirSync(dirPath, { recursive: true });
    return dirPath;
  }

  /**
   * Gets the path to a chat's input file.
   *
   * @param chatId - The chat ID
   * @returns The absolute path to the input file (e.g., `/tmp/kalamari/input/chat_{chatId}.md`)
   */
  getChatInputPath(chatId: string): string {
    return join(this.ensureChatInputDir(), `chat_${chatId}.md`);
  }

  /**
   * Ensures the chat output directory exists, creating it if necessary.
   *
   * @returns The absolute path to the output directory (e.g., `/tmp/kalamari/output/`)
   */
  ensureChatOutputDir(): string {
    const dirPath = join(tmpdir(), 'kalamari', 'output');
    mkdirSync(dirPath, { recursive: true });
    return dirPath;
  }

  /**
   * Gets the path to a queue's output file.
   *
   * @param queueId - The queue ID
   * @returns The absolute path to the output file (e.g., `/tmp/kalamari/output/chat_queue_{queueId}_output.json`)
   */
  getChatOutputPath(queueId: string): string {
    return join(
      this.ensureChatOutputDir(),
      `chat_queue_${queueId}_output.json`,
    );
  }

  /**
   * Ensures the chat working directory exists, creating it if necessary.
   * Used as a fallback when workspace.workingDirectory is not set.
   *
   * @param chatId - The chat ID
   * @returns The absolute path to the working directory (e.g., `/tmp/kalamari/chats/{chatId}/`)
   */
  ensureChatWorkDir(chatId: string): string {
    const dirPath = join(tmpdir(), 'kalamari', 'chats', chatId);
    mkdirSync(dirPath, { recursive: true });
    return dirPath;
  }

  /**
   * Ensures the chat logs directory exists, creating it if necessary.
   *
   * @returns The absolute path to the logs directory (e.g., `/tmp/kalamari/logs/`)
   */
  ensureChatLogsDir(): string {
    const dirPath = join(tmpdir(), 'kalamari', 'logs');
    mkdirSync(dirPath, { recursive: true });
    return dirPath;
  }

  /**
   * Gets the path to a queue's log file.
   *
   * @param queueId - The queue ID
   * @returns The absolute path to the log file (e.g., `/tmp/kalamari/logs/chat_queue_{queueId}.log`)
   */
  getChatQueueLogPath(queueId: string): string {
    return join(this.ensureChatLogsDir(), `chat_queue_${queueId}.log`);
  }
}
