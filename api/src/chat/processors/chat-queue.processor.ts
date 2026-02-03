import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';

import { CliRegistryService } from '../../cli/services/cli-registry.service';
import { CliType } from '../../cli/types';
import { AppConfig } from '../../core/config/config';
import { ChatEntity } from '../../core/entities/chat.entity';
import { ChatMessageEntity } from '../../core/entities/chat-message.entity';
import { ChatQueueEntity } from '../../core/entities/chat-queue.entity';
import { WorkspaceEntity } from '../../core/entities/workspace.entity';
import { DirService } from '../../core/services/dir.service';
import { ChatEvents } from '../../event/constants';
import { ChatQueueCreatedEvent } from '../../event/dtos';
import { chatInstructionTemplate } from '../../template/resources/chat-instruction.template';
import { TemplateService } from '../../template/services/template.service';
import { AgentAction } from '../agent-actions/types';
import { AgentActionsService } from '../services/agent-actions.service';
import { ChatContextFile, ChatMessageLine } from '../types';

@Injectable()
export class ChatQueueProcessor {
  private readonly logger = new Logger(ChatQueueProcessor.name);
  private readonly isDisabled: boolean;

  constructor(
    @InjectRepository(ChatQueueEntity)
    private readonly queueRepository: Repository<ChatQueueEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepository: Repository<ChatMessageEntity>,
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly configService: ConfigService,
    private readonly dirService: DirService,
    private readonly cliRegistryService: CliRegistryService,
    private readonly agentActionsService: AgentActionsService,
    private readonly templateService: TemplateService,
  ) {
    this.isDisabled =
      this.configService.get<AppConfig>('root')?.processor.disabled ?? false;
  }

  @OnEvent(ChatEvents.QUEUE_CREATED)
  handleQueueCreated(event: ChatQueueCreatedEvent): void {
    void this.processQueue(event.queueId);
  }

  private async processQueue(queueId: string): Promise<void> {
    if (this.isDisabled) {
      return;
    }

    try {
      // Step 1: Validate queue exists and is pending
      const queue = await this.queueRepository.findOne({
        where: { id: queueId },
      });

      if (!queue) {
        this.logger.warn(`Queue ${queueId} not found`);
        return;
      }

      if (queue.status !== 'pending') {
        this.logger.debug(
          `Queue ${queueId} status is ${queue.status}, skipping`,
        );
        return;
      }

      // Step 2: Update status to in_progress
      await this.queueRepository.update(
        { id: queueId },
        { status: 'in_progress' },
      );

      // Step 3: Fetch chat and workspace data
      const chat = await this.chatRepository.findOne({
        where: { id: queue.chatId },
      });

      if (!chat) {
        throw new Error(`Chat ${queue.chatId} not found`);
      }

      const workspace = await this.workspaceRepository.findOne({
        where: { id: chat.workspaceId },
      });

      if (!workspace) {
        throw new Error(`Workspace ${chat.workspaceId} not found`);
      }

      // Fetch all messages for the chat
      const messages = await this.messageRepository.find({
        where: { chatId: queue.chatId },
        order: { createdAt: 'ASC' },
      });

      // Find the latest user message
      const latestUserMessage = [...messages]
        .reverse()
        .find((m) => m.actorType === 'user');

      if (!latestUserMessage) {
        throw new Error('No user message found in chat');
      }

      // Step 4: Write context files
      const contextFilePath = this.dirService.getChatContextPath(chat.id);
      const messagesFilePath = this.dirService.getChatMessagesPath(chat.id);
      const outputFilePath = this.dirService.getChatOutputPath(queueId);

      // Write chat context file
      const contextFile: ChatContextFile = {
        chat: {
          id: chat.id,
          name: chat.name,
          workspaceId: chat.workspaceId,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        },
        workspace: {
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          workingDirectory: workspace.workingDirectory,
        },
      };
      writeFileSync(contextFilePath, JSON.stringify(contextFile, null, 2));

      // Write messages file (JSONL format)
      const messageLines = messages.map((m) => {
        const line: ChatMessageLine = {
          actorType: m.actorType,
          text: m.text,
          createdAt: m.createdAt,
        };
        return JSON.stringify(line);
      });
      writeFileSync(messagesFilePath, messageLines.join('\n'));

      // Step 5: Build instruction from template
      const instruction = this.templateService.render(chatInstructionTemplate, {
        contextFilePath,
        messagesFilePath,
        latestMessageJson: JSON.stringify(
          {
            actorType: latestUserMessage.actorType,
            text: latestUserMessage.text,
            createdAt: latestUserMessage.createdAt,
          },
          null,
          2,
        ),
        outputFilePath,
      });

      // Step 5.5: Write instruction to file
      const inputFilePath = this.dirService.getChatInputPath(chat.id);
      writeFileSync(inputFilePath, instruction);

      // Step 6: Determine working directory
      const cwd =
        workspace.workingDirectory ??
        this.dirService.ensureChatWorkDir(chat.id);

      // Step 7: Execute CLI
      // TODO: Make CLI type configurable per workspace or chat
      const cliType = CliType.Claude;
      const adapter = this.cliRegistryService.getByType(cliType);

      if (!adapter) {
        throw new Error(`CLI adapter not found for type: ${cliType}`);
      }

      const logFilePath = this.dirService.getChatQueueLogPath(queueId);

      this.logger.debug(
        `Executing ${cliType} CLI for queue ${queueId} in ${cwd}, logging to ${logFilePath}`,
      );

      const result = await adapter.execute({
        stdin: `Please read ${inputFilePath} then follow the instruction.`,
        cwd,
        logFilePath,
      });

      if (result.exitCode !== 0) {
        this.logger.warn(
          `Claude CLI exited with code ${result.exitCode}: ${result.stderr}`,
        );
      }

      // Step 8: Read and parse output file
      if (!existsSync(outputFilePath)) {
        throw new Error(
          `Output file not found: ${outputFilePath}. CLI stdout: ${result.stdout.slice(0, 500)}`,
        );
      }

      const outputContent = readFileSync(outputFilePath, 'utf-8');
      let actions: AgentAction[];

      try {
        actions = JSON.parse(outputContent);
      } catch {
        throw new Error(
          `Failed to parse output file as JSON: ${outputContent.slice(0, 500)}`,
        );
      }

      // Step 9: Validate output is a non-empty array
      if (!Array.isArray(actions)) {
        throw new Error('Output must be a JSON array of actions');
      }

      if (actions.length === 0) {
        throw new Error('Output array must contain at least one action');
      }

      // Step 10: Process actions via AgentActionsService
      await this.agentActionsService.processActions(actions, {
        chatId: queue.chatId,
        queueId,
      });

      // Step 11: Update status to completed
      await this.queueRepository.update(
        { id: queueId },
        { status: 'completed' },
      );

      this.logger.debug(`Queue ${queueId} completed successfully`);
    } catch (error) {
      this.logger.error(`Error processing queue ${queueId}:`, error);

      await this.queueRepository.update({ id: queueId }, { status: 'failed' });

      const queue = await this.queueRepository.findOne({
        where: { id: queueId },
      });

      if (queue) {
        const logFilePath = this.dirService.getChatQueueLogPath(queueId);
        const systemMessage = this.messageRepository.create({
          id: nanoid(),
          chatId: queue.chatId,
          actorType: 'system',
          actorId: null,
          text: `Error processing message: ${error instanceof Error ? error.message : 'Unknown error'}. Check logs at: ${logFilePath}`,
        });

        await this.messageRepository.save(systemMessage);
      }
    }
  }
}
