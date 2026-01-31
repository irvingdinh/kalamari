import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ChatMessageEntity } from './chat-message.entity';
import { ChatQueueEntity } from './chat-queue.entity';
import { WorkspaceEntity } from './workspace.entity';

@Entity({ name: 'chats' })
export class ChatEntity {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'workspace_id' })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: WorkspaceEntity;

  @Column({ default: 'Untitled chat' })
  name: string;

  @OneToMany(() => ChatMessageEntity, (m) => m.chat, { cascade: true })
  messages: ChatMessageEntity[];

  @OneToMany(() => ChatQueueEntity, (q) => q.chat, { cascade: true })
  queues: ChatQueueEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
