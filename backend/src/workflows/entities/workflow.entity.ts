import {
  Entity, ManyToOne, PrimaryGeneratedColumn, OneToMany, Column,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { WorkflowActionsEntity } from './workflow.actions.entity';
import { WorkflowReactionsEntity } from './workflow.reactions.entity';

@Entity('workflows')
export class WorkflowEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
    name: 'id',
  })
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'name',
  })
  name: string;

  @Column({
    type: 'boolean',
    nullable: false,
    name: 'enabled',
  })
  enabled: boolean;

  @OneToMany(() => WorkflowActionsEntity, (action) => action.workflow, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: false,
  })
  actions: WorkflowActionsEntity[];

  @OneToMany(() => WorkflowReactionsEntity, (reaction) => reaction.workflow, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: false,
  })
  reactions: WorkflowReactionsEntity[];

  @ManyToOne(() => User, (user) => user.workflows, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: false,
  })
  owner: User;
}
