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

import { AgentEntity } from './agent.entity';
import { ChatMessageEntity } from './chat-message.entity';
import { ChatQueueEntity } from './chat-queue.entity';
import { WorkspaceEntity } from './workspace.entity';

@Entity({ name: 'chats' })
export class ChatEntity {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column({ name: 'workspace_id' })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: WorkspaceEntity;

  @Index()
  @Column({ name: 'agent_id', type: 'text', nullable: true })
  agentId: string | null;

  @ManyToOne(() => AgentEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'agent_id' })
  agent: AgentEntity | null;

  @Column({ default: 'Untitled chat' })
  name: string;

  @Column({ name: 'cli_type', type: 'text', nullable: true })
  cliType: string | null;

  @OneToMany(() => ChatMessageEntity, (m) => m.chat, { cascade: true })
  messages: ChatMessageEntity[];

  @OneToMany(() => ChatQueueEntity, (q) => q.chat, { cascade: true })
  queues: ChatQueueEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
