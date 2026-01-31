import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { ChatEntity } from './chat.entity';

@Entity({ name: 'chat_messages' })
export class ChatMessageEntity {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'chat_id' })
  chatId: string;

  @ManyToOne(() => ChatEntity, (c) => c.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: ChatEntity;

  @Column({ name: 'actor_type' })
  actorType: string;

  // `type: 'text'` is required because TypeORM cannot infer the type from `string | null`
  @Column({ name: 'actor_id', type: 'text', nullable: true })
  actorId: string | null;

  @Column()
  text: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
