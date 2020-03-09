import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { Expose } from 'class-transformer';
import { Type, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { ReactionEntity, Reaction, ReactionResult } from '../modules.reaction';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import * as SSHClient from 'node-ssh';

class SSHCommandReactionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  ip: string;

  @IsInt()
  @Min(0)
  @Expose()
  port: number;

  @IsNotEmpty()
  @IsString()
  @Expose()
  username: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  sshkey: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  command: string;
}

@Entity('ssh_command_reaction')
export class SSHCommandReactionEntity implements ReactionEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  instanceId: string;

  @ManyToOne(() => User, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  owner: User;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  ip: string;

  @Column({
    type: 'integer',
    nullable: false,
  })
  port: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  username: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  sshkey: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  command: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([SSHCommandReactionEntity])],
})
export class SSHCommandReaction extends Reaction<SSHCommandReactionDTO, SSHCommandReactionEntity> {
  constructor(
    @InjectRepository(SSHCommandReactionEntity)
    private readonly repository: Repository<SSHCommandReactionEntity>,
  ) {
    super();
  }

  async apply(config: SSHCommandReactionEntity): Promise<ReactionResult> {
    const client = new SSHClient();
    
    await client.connect({
      host: config.ip,
      port: config.port,
      username: config.username,
      privateKey: config.sshkey,
    });

    await client.execCommand(config.command);
  }

  get service(): string {
    return 'ssh';
  }

  get name(): string {
    return 'Command';
  }

  get description(): string {
    return 'Execute a command on a remote host';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'ip', name: 'IP Address',
          description: 'Remote host ip address',
        },
        {
          kind: 'number', formId: 'port', name: 'Port',
          description: 'Remote host port', minValue: 0,
        },
        {
          kind: 'text', formId: 'username', name: 'Username',
          description: 'Username to use to login',
        },
        {
          kind: 'text', formId: 'sshkey', name: 'SSH Key',
          description: 'SSH Key to use to login',
        },
        {
          kind: 'text', formId: 'command', name: 'Command',
          description: 'Command to execute on the remote host',
        },
      ],
    };
  }

  dtoToEntity(dto: SSHCommandReactionDTO): DeepPartial<SSHCommandReactionEntity> {
    return {
      ip: dto.ip,
      port: dto.port,
      username: dto.username,
      sshkey: dto.sshkey,
      command: dto.command,
    };
  }

  createTestEntity(testOwner: User): SSHCommandReactionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      ip: 'jeremylvln.fr',
      port: 2476,
      username: 'jeremy',
      sshkey: '',
      command: 'ls',
    };
  }

  get entityRepository(): Repository<SSHCommandReactionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<SSHCommandReactionDTO> {
    return SSHCommandReactionDTO;
  }

  get reactionName(): string {
    return 'ssh-command';
  }
}
