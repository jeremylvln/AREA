import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Repository, Column,
} from 'typeorm';
import { Type, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import * as SSHClient from 'node-ssh';
import { Expose } from 'class-transformer';
import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

class SSHCommandActionDTO {
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

@Entity('ssh_command_action')
export class SSHCommandActionEntity implements ActionEntity {
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
  imports: [TypeOrmModule.forFeature([SSHCommandActionEntity])],
})
export class SSHCommandAction extends Action<SSHCommandActionDTO, SSHCommandActionEntity> {
  constructor(
    @InjectRepository(SSHCommandActionEntity)
    private readonly repository: Repository<SSHCommandActionEntity>,
  ) {
    super();
  }

  async test(config: SSHCommandActionEntity): Promise<ActionResult> {
    const client = new SSHClient();
    
    await client.connect({
      host: config.ip,
      port: config.port,
      username: config.username,
      privateKey: config.sshkey,
    });

    const res = await client.execCommand(config.command);
    return res.code === 0;
  }

  get service(): string {
    return 'ssh';
  }

  get name(): string {
    return 'Command';
  }

  get description(): string {
    return 'Execute a command to the remote host and validate is succeeded';
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

  dtoToEntity(dto: SSHCommandActionDTO): DeepPartial<SSHCommandActionEntity> {
    return {
      ip: dto.ip,
      port: dto.port,
      username: dto.username,
      sshkey: dto.sshkey,
      command: dto.command,
    };
  }

  createTestEntity(testOwner: User): SSHCommandActionEntity {
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

  get entityRepository(): Repository<SSHCommandActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<SSHCommandActionDTO> {
    return SSHCommandActionDTO;
  }

  get actionName(): string {
    return 'ssh-command';
  }
}
