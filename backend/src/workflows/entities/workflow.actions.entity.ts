import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WorkflowEntity } from './workflow.entity';

@Entity('workflows_actions')
export class WorkflowActionsEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
    name: 'id',
  })
  id: string;

  @ManyToOne(() => WorkflowEntity, (workflow) => workflow.actions, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  workflow: WorkflowEntity;

  @Column({
    type: 'varchar',
    length: 42,
    nullable: false,
    primary: true,
  })
  actionKind: string;

  @Column({
    type: 'bigint',
    unsigned: true,
    nullable: false,
    primary: true,
  })
  actionId: string;
}
