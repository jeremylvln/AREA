import {
  Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { UserBridge } from '../utils';
import { User } from '../../users/user.entity';

@Entity('users_facebook')
export class UserFacebook implements UserBridge {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
    name: 'id',
  })
  id: string;

  @Column('varchar', {
    length: 80,
    nullable: false,
    name: 'fid',
  })
  fid: string;

  @OneToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: false,
    name: 'updated_at',
  })
  updatedAt: Date;
}
