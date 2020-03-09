import {
  Entity, Column, PrimaryGeneratedColumn, OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { WorkflowEntity } from '../workflows/entities/workflow.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
    name: 'id',
  })
  id: string;

  @Column('varchar', {
    unique: true,
    nullable: false,
    name: 'email',
  })
  email: string;

  @Exclude()
  @Column('varchar', {
    nullable: true,
    name: 'password',
  })
  password?: string;

  @Column('varchar', {
    nullable: true,
    name: 'firstname',
  })
  firstname: string;

  @Column('varchar', {
    nullable: true,
    name: 'lastname',
  })
  lastname: string;

  @OneToMany(() => WorkflowEntity, (workflow) => workflow.owner)
  workflows: WorkflowEntity[];
}
