import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { TaskEntity } from './task.entity';

@Entity({ name: 'task_comments' })
export class TaskCommentEntity {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column({ name: 'task_id' })
  taskId: string;

  @ManyToOne(() => TaskEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity;

  @Column({ name: 'actor_type' })
  actorType: string;

  // `type: 'text'` is required because TypeORM cannot infer the type from `string | null`
  @Column({ name: 'actor_id', type: 'text', nullable: true })
  actorId: string | null;

  @Column({ type: 'text' })
  text: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
