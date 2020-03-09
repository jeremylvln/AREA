import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsNotEmpty, IsString, IsInt } from 'class-validator';
import { Expose } from 'class-transformer';
import * as Rcon from 'rcon';
import { Type, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { ReactionEntity, Reaction, ReactionResult } from '../modules.reaction';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';

class MinecraftCommandReactionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  ip: string;

  @IsNotEmpty()
  @IsInt()
  @Expose()
  port: number;

  @IsNotEmpty()
  @IsString()
  @Expose()
  password: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  command: string;
}

@Entity('minecraft_command_reaction')
export class MinecraftCommandReactionEntity implements ReactionEntity {
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
  password: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  command: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([MinecraftCommandReactionEntity])],
})
export class MinecraftCommandReaction extends Reaction<MinecraftCommandReactionDTO, MinecraftCommandReactionEntity> {
  constructor(
    @InjectRepository(MinecraftCommandReactionEntity)
    private readonly repository: Repository<MinecraftCommandReactionEntity>,
  ) {
    super();
  }

  async apply(config: MinecraftCommandReactionEntity): Promise<ReactionResult> {
    const rcon = new Rcon(config.ip, config.port, config.password, {
      tcp: true,
      challenge: false,
    });

    rcon.connect();
    rcon.send(config.command);
    rcon.disconnect();
  }

  get service(): string {
    return 'minecraft';
  }

  get name(): string {
    return 'Command';
  }

  get description(): string {
    return 'Send a command to a Minecraft server';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'ip', name: 'IP address',
          description: 'IP address of the Minecraft Server',
        },
        {
          kind: 'number', formId: 'port', name: 'Port',
          description: 'Rcon port of the Minecraft server',
        },
        {
          kind: 'text', formId: 'password', name: 'Password',
          description: 'Rcon password of the Minecraft server',
        },
        {
          kind: 'text', formId: 'command', name: 'Command',
          description: 'Command to perform on the Minecraft server',
        },
      ],
    };
  }

  dtoToEntity(dto: MinecraftCommandReactionDTO): DeepPartial<MinecraftCommandReactionEntity> {
    return {
      ip: dto.ip,
      port: dto.port,
      password: dto.password,
      command: dto.command,
    };
  }

  createTestEntity(testOwner: User): MinecraftCommandReactionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      ip: 'jeremylvln.fr',
      port: 25566,
      password: 'secr3tpassw0rd',
      command: '/say Hello from AREA',
    };
  }

  get entityRepository(): Repository<MinecraftCommandReactionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<MinecraftCommandReactionDTO> {
    return MinecraftCommandReactionDTO;
  }

  get reactionName(): string {
    return 'minecraft-command';
  }
}
