import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { ChatEntity } from './chat.entity';

@Entity({ name: 'chat_queues' })
export class ChatQueueEntity {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'chat_id' })
  chatId: string;

  @ManyToOne(() => ChatEntity, (c) => c.queues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: ChatEntity;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
