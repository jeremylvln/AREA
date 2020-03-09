import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { Expose } from 'class-transformer';
import { Type, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import * as api from 'twitch-api-v5';

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;

class TwitchStreamStateActionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  channel: string;
  
  @IsBoolean()
  @Expose()
  online: boolean;
}

@Entity('twitch_stream_state_action')
export class TwitchStreamStateActionEntity implements ActionEntity {
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
  channel: string;
  
  @Column({
    type: 'boolean',
    nullable: false,
  })
  online: boolean;
}

@Module({
  imports: [TypeOrmModule.forFeature([TwitchStreamStateActionEntity])],
})
export class TwitchStreamStateAction extends Action<TwitchStreamStateActionDTO, TwitchStreamStateActionEntity> {
  constructor(
    @InjectRepository(TwitchStreamStateActionEntity)
    private readonly repository: Repository<TwitchStreamStateActionEntity>,
  ) {
    super();
  }
  
  async test(config: TwitchStreamStateActionEntity): Promise<ActionResult> {
    (api as any).clientID = CLIENT_ID;

    return new Promise<boolean>((resolve, reject) => {
      api.users.usersByName({
        users: config.channel,
      }, (err, res) => {
        if (err) {
          reject(err);
          return;
        }

        api.streams.channel({
          channelID: res.users[0]._id,
        }, (err, res) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(config.online ? res.stream != null : res.stream == null);
        });
      });
    });
  }
  
  get service(): string {
    return 'twitch';
  }
  
  get name(): string {
    return 'Stream';
  }
  
  get description(): string {
    return 'Trigger when there is a stream on a channel';
  }
  
  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'channel', name: 'Channel Name',
          description: 'Name of the channel to monitor',
        },
        {
          kind: 'checkbox', formId: 'online', name: 'Online',
          description: 'Whether trigger the action when the channel is online or offline',
        },
      ],
    };
  }
  
  dtoToEntity(dto: TwitchStreamStateActionDTO): DeepPartial<TwitchStreamStateActionEntity> {
    return {
      channel: dto.channel,
      online: dto.online,
    };
  }
  
  createTestEntity(testOwner: User): TwitchStreamStateActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      channel: 'monstercat',
      online: true,
    };
  }
  
  get entityRepository(): Repository<TwitchStreamStateActionEntity> {
    return this.repository;
  }
  
  get dtoClass(): Type<TwitchStreamStateActionDTO> {
    return TwitchStreamStateActionDTO;
  }
  
  get actionName(): string {
    return 'twitch-stream-state';
  }
}
