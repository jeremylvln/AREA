import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WorkflowEntity } from './workflow.entity';

@Entity('workflows_reactions')
export class WorkflowReactionsEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
    name: 'id',
  })
  id: string;

  @ManyToOne(() => WorkflowEntity, (workflow) => workflow.reactions, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  workflow: WorkflowEntity;

  @Column({
    type: 'varchar',
    length: 42,
    nullable: false,
  })
  reactionKind: string;

  @Column({
    type: 'bigint',
    unsigned: true,
    nullable: false,
  })
  reactionId: string;
}
