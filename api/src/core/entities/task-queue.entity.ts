import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { TaskQueueStatus } from '../../task/types';
import { TaskEntity } from './task.entity';

@Entity({ name: 'task_queues' })
export class TaskQueueEntity {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column({ name: 'task_id' })
  taskId: string;

  @ManyToOne(() => TaskEntity, (t) => t.queues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity;

  @Index()
  @Column({ default: TaskQueueStatus.Pending })
  status: string;

  @Column({ default: false })
  priority: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
