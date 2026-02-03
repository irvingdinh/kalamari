import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { Repository } from 'typeorm';

import { CliRegistryService } from '../../cli/services/cli-registry.service';
import { CliType } from '../../cli/types';
import { AppConfig } from '../../core/config/config';
import { AgentEntity } from '../../core/entities/agent.entity';
import { TaskEntity } from '../../core/entities/task.entity';
import { TaskCommentEntity } from '../../core/entities/task-comment.entity';
import { WorkspaceEntity } from '../../core/entities/workspace.entity';
import { DirService } from '../../core/services/dir.service';
import { TaskEvents } from '../../event/constants';
import { TaskQueueCreatedEvent } from '../../event/dtos';
import { taskAgentInstructionTemplate } from '../../template/resources/task-agent-instruction.template';
import { taskOrchestratorInstructionTemplate } from '../../template/resources/task-orchestrator-instruction.template';
import { TemplateService } from '../../template/services/template.service';
import {
  TaskAgentAction,
  TaskOrchestratorAction,
} from '../agent-actions/types';
import { TaskAgentActionsService } from '../services/task-agent-actions.service';
import { TaskCommentsService } from '../services/task-comments.service';
import { TaskOrchestratorActionsService } from '../services/task-orchestrator-actions.service';
import { TaskCommentLine, TaskContextFile, TaskStatus } from '../types';

const MAX_ITERATIONS = 20;

@Injectable()
export class TaskQueueProcessor {
  private readonly logger = new Logger(TaskQueueProcessor.name);
  private readonly isDisabled: boolean;
  private readonly defaultCliType: CliType;
  private readonly processingMap = new Map<string, boolean>();

  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(TaskCommentEntity)
    private readonly taskCommentRepository: Repository<TaskCommentEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    private readonly configService: ConfigService,
    private readonly dirService: DirService,
    private readonly cliRegistryService: CliRegistryService,
    private readonly orchestratorActionsService: TaskOrchestratorActionsService,
    private readonly agentActionsService: TaskAgentActionsService,
    private readonly taskCommentsService: TaskCommentsService,
    private readonly templateService: TemplateService,
  ) {
    const config = this.configService.get<AppConfig>('root')!;
    this.isDisabled = config.processor.disabled ?? false;
    this.defaultCliType = config.processor.defaultCli ?? CliType.Claude;
  }

  @OnEvent(TaskEvents.QUEUE_CREATED)
  handleQueueCreated(event: TaskQueueCreatedEvent): void {
    void this.processTask(event.taskId);
  }

  private async processTask(taskId: string): Promise<void> {
    if (this.isDisabled) {
      return;
    }

    if (this.processingMap.has(taskId)) {
      this.logger.debug(`Task ${taskId} is already being processed, skipping`);
      return;
    }

    this.processingMap.set(taskId, true);

    try {
      // Set task status to in_progress
      const initialTask = await this.taskRepository.findOne({
        where: { id: taskId },
      });

      if (!initialTask) {
        this.logger.warn(`Task ${taskId} not found`);
        return;
      }

      await this.taskRepository.update(
        { id: taskId },
        {
          status: TaskStatus.IN_PROGRESS,
          lastActivityAt: new Date(),
        },
      );

      let iteration = 0;

      while (iteration < MAX_ITERATIONS) {
        iteration++;

        this.logger.debug(
          `Task ${taskId} orchestrator loop iteration ${iteration}`,
        );

        try {
          // Step 1: Re-read task from DB
          const task = await this.taskRepository.findOne({
            where: { id: taskId },
          });

          if (!task) {
            this.logger.warn(`Task ${taskId} not found during iteration`);
            break;
          }

          // Step 2: If status NOT backlog/in_progress → break
          if (
            task.status !== TaskStatus.BACKLOG &&
            task.status !== TaskStatus.IN_PROGRESS
          ) {
            this.logger.debug(
              `Task ${taskId} status is ${task.status}, exiting loop`,
            );
            break;
          }

          // Step 3: Fetch workspace, agents, comments
          const workspace = await this.workspaceRepository.findOne({
            where: { id: task.workspaceId },
          });

          if (!workspace) {
            throw new Error(`Workspace ${task.workspaceId} not found`);
          }

          const agents = await this.agentRepository.find({
            where: { workspaceId: task.workspaceId },
            order: { sortOrder: 'ASC' },
          });

          const comments = await this.taskCommentRepository.find({
            where: { taskId },
            order: { createdAt: 'ASC' },
          });

          // Step 4: If zero agents → system comment, set wait_for_review, break
          if (agents.length === 0) {
            await this.taskCommentsService.createSystemComment(
              taskId,
              'No agents configured for this workspace. Please add agents and try again.',
            );
            await this.taskRepository.update(
              { id: taskId },
              {
                status: TaskStatus.WAIT_FOR_REVIEW,
                lastActivityAt: new Date(),
              },
            );
            break;
          }

          // Step 5: Write context files
          const contextFilePath = this.dirService.getTaskContextPath(taskId);
          const commentsFilePath = this.dirService.getTaskCommentsPath(taskId);
          const outputFilePath = this.dirService.getTaskOrchestratorOutputPath(
            taskId,
            iteration,
          );

          this.writeContextFiles(
            contextFilePath,
            commentsFilePath,
            task,
            workspace,
            agents,
            comments,
          );

          // Step 6: Render orchestrator template and execute CLI
          const instruction = this.templateService.render(
            taskOrchestratorInstructionTemplate,
            {
              contextFilePath,
              commentsFilePath,
              outputFilePath,
              hasAgents: agents.length > 0,
              agents: agents.map((a) => ({
                id: a.id,
                name: a.name,
                description: a.description,
                cliType: a.cliType,
              })),
              task: {
                summary: task.summary,
                description: task.description,
                status: task.status,
              },
            },
          );

          const cwd =
            workspace.workingDirectory ??
            this.dirService.ensureTaskWorkDir(taskId);

          const adapter = this.cliRegistryService.getByType(
            this.defaultCliType,
          );

          if (!adapter) {
            throw new Error(
              `CLI adapter not found for type: ${this.defaultCliType}`,
            );
          }

          const logFilePath = this.dirService.getTaskOrchestratorLogPath(
            taskId,
            iteration,
          );

          this.logger.debug(
            `Executing ${this.defaultCliType} CLI for task ${taskId} orchestrator iteration ${iteration} in ${cwd}`,
          );

          const result = await adapter.execute({
            stdin: instruction,
            cwd,
            logFilePath,
          });

          if (result.exitCode !== 0) {
            this.logger.warn(
              `${this.defaultCliType} exited with code ${result.exitCode}: ${result.stderr}`,
            );
          }

          // Step 7: Parse output JSON
          if (!existsSync(outputFilePath)) {
            throw new Error(
              `Output file not found: ${outputFilePath}. CLI stdout: ${result.stdout.slice(0, 500)}`,
            );
          }

          const outputContent = readFileSync(outputFilePath, 'utf-8');
          let actions: TaskOrchestratorAction[];

          try {
            actions = JSON.parse(outputContent);
          } catch {
            throw new Error(
              `Failed to parse orchestrator output as JSON: ${outputContent.slice(0, 500)}`,
            );
          }

          if (!Array.isArray(actions)) {
            throw new Error(
              'Orchestrator output must be a JSON array of actions',
            );
          }

          if (actions.length === 0) {
            throw new Error(
              'Orchestrator output array must contain at least one action',
            );
          }

          // Step 8: Process actions via TaskOrchestratorActionsService
          const triggeredAgentIds =
            await this.orchestratorActionsService.processActions(actions, {
              taskId,
            });

          // Step 9: For each triggered agent, execute agent CLI
          for (const agentId of triggeredAgentIds) {
            try {
              await this.executeAgent(
                taskId,
                agentId,
                iteration,
                workspace,
                agents,
              );
            } catch (agentError) {
              const errorMessage =
                agentError instanceof Error
                  ? agentError.message
                  : 'Unknown error';
              this.logger.error(
                `Error executing agent ${agentId} for task ${taskId}: ${errorMessage}`,
              );
              await this.taskCommentsService.createSystemComment(
                taskId,
                `Error executing agent ${agentId}: ${errorMessage}`,
              );
            }
          }

          // Step 11: Update task.lastActivityAt
          await this.taskRepository.update(
            { id: taskId },
            { lastActivityAt: new Date() },
          );
        } catch (error) {
          // Step 10: On error → system comment with details, continue loop
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Error in orchestrator loop iteration ${iteration} for task ${taskId}: ${errorMessage}`,
          );
          await this.taskCommentsService.createSystemComment(
            taskId,
            `Error in orchestrator iteration ${iteration}: ${errorMessage}`,
          );
        }
      }

      if (iteration >= MAX_ITERATIONS) {
        this.logger.warn(
          `Task ${taskId} reached max iterations (${MAX_ITERATIONS})`,
        );
        await this.taskCommentsService.createSystemComment(
          taskId,
          `Orchestrator reached maximum iterations (${MAX_ITERATIONS}). Task paused for review.`,
        );
        await this.taskRepository.update(
          { id: taskId },
          {
            status: TaskStatus.WAIT_FOR_REVIEW,
            lastActivityAt: new Date(),
          },
        );
      }
    } finally {
      this.processingMap.delete(taskId);
    }
  }

  private async executeAgent(
    taskId: string,
    agentId: string,
    iteration: number,
    workspace: WorkspaceEntity,
    agents: AgentEntity[],
  ): Promise<void> {
    const agent = agents.find((a) => a.id === agentId);

    if (!agent) {
      throw new Error(`Agent ${agentId} not found in workspace agents`);
    }

    // Re-fetch comments (may have been updated by orchestrator actions)
    const comments = await this.taskCommentRepository.find({
      where: { taskId },
      order: { createdAt: 'ASC' },
    });

    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Write context files with fresh data
    const contextFilePath = this.dirService.getTaskContextPath(taskId);
    const commentsFilePath = this.dirService.getTaskCommentsPath(taskId);
    const outputFilePath = this.dirService.getTaskAgentOutputPath(
      taskId,
      agentId,
      iteration,
    );

    this.writeContextFiles(
      contextFilePath,
      commentsFilePath,
      task,
      workspace,
      agents,
      comments,
    );

    // Render agent template
    const instruction = this.templateService.render(
      taskAgentInstructionTemplate,
      {
        contextFilePath,
        commentsFilePath,
        outputFilePath,
        agentInstruction: agent.instruction ?? null,
        task: {
          summary: task.summary,
          description: task.description,
          status: task.status,
        },
        agents: agents.map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          cliType: a.cliType,
        })),
      },
    );

    const cwd =
      workspace.workingDirectory ?? this.dirService.ensureTaskWorkDir(taskId);

    const cliType = agent.cliType as CliType;
    const adapter = this.cliRegistryService.getByType(cliType);

    if (!adapter) {
      throw new Error(`CLI adapter not found for type: ${cliType}`);
    }

    const logFilePath = this.dirService.getTaskAgentLogPath(
      taskId,
      agentId,
      iteration,
    );

    this.logger.debug(
      `Executing ${cliType} CLI for task ${taskId} agent ${agentId} iteration ${iteration}`,
    );

    const result = await adapter.execute({
      stdin: instruction,
      cwd,
      logFilePath,
    });

    if (result.exitCode !== 0) {
      this.logger.warn(
        `${cliType} exited with code ${result.exitCode} for agent ${agentId}: ${result.stderr}`,
      );
    }

    // Parse agent output
    if (!existsSync(outputFilePath)) {
      throw new Error(
        `Agent output file not found: ${outputFilePath}. CLI stdout: ${result.stdout.slice(0, 500)}`,
      );
    }

    const outputContent = readFileSync(outputFilePath, 'utf-8');
    let actions: TaskAgentAction[];

    try {
      actions = JSON.parse(outputContent);
    } catch {
      throw new Error(
        `Failed to parse agent output as JSON: ${outputContent.slice(0, 500)}`,
      );
    }

    if (!Array.isArray(actions)) {
      throw new Error('Agent output must be a JSON array of actions');
    }

    if (actions.length === 0) {
      return;
    }

    // Process agent actions
    await this.agentActionsService.processActions(actions, {
      taskId,
      agentId,
    });
  }

  private writeContextFiles(
    contextFilePath: string,
    commentsFilePath: string,
    task: TaskEntity,
    workspace: WorkspaceEntity,
    agents: AgentEntity[],
    comments: TaskCommentEntity[],
  ): void {
    const contextFile: TaskContextFile = {
      task: {
        id: task.id,
        workspaceId: task.workspaceId,
        summary: task.summary,
        description: task.description,
        status: task.status,
        lastActivityAt: task.lastActivityAt,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        workingDirectory: workspace.workingDirectory,
      },
      agents: agents.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        cliType: a.cliType,
      })),
    };
    writeFileSync(contextFilePath, JSON.stringify(contextFile, null, 2));

    const commentLines = comments.map((c) => {
      const line: TaskCommentLine = {
        actorType: c.actorType,
        actorId: c.actorId,
        text: c.text,
        createdAt: c.createdAt,
      };
      return JSON.stringify(line);
    });
    writeFileSync(commentsFilePath, commentLines.join('\n'));
  }
}
