import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'workspaces' })
export class WorkspaceEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  // `type: 'text'` is required because TypeORM cannot infer the type from `string | null`
  @Column({ type: 'text', nullable: true })
  description: string | null;

  // `type: 'text'` is required because TypeORM cannot infer the type from `string | null`
  @Column({ name: 'working_directory', type: 'text', nullable: true })
  workingDirectory: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
