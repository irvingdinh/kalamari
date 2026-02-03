import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TaskStatus } from '../../task/types';
import { TaskCommentEntity } from './task-comment.entity';
import { TaskQueueEntity } from './task-queue.entity';
import { WorkspaceEntity } from './workspace.entity';

@Entity({ name: 'tasks' })
export class TaskEntity {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column({ name: 'workspace_id' })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: WorkspaceEntity;

  @Column()
  summary: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: TaskStatus.Todo })
  status: string;

  @Column({ name: 'last_activity_at' })
  lastActivityAt: Date;

  @OneToMany(() => TaskCommentEntity, (c) => c.task, { cascade: true })
  comments: TaskCommentEntity[];

  @OneToMany(() => TaskQueueEntity, (q) => q.task, { cascade: true })
  queues: TaskQueueEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
