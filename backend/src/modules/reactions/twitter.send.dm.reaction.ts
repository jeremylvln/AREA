import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { Type, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import * as Twit from 'twit';
import { ReactionEntity, Reaction, ReactionResult } from '../modules.reaction';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import { CacheModule } from 'cache/cache.module';
import { CacheService } from 'cache/cache.service';
import { createTwitter, getTwitterUser } from 'modules/utils/twitter.utils';

class TwitterSendDMReactionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  account: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  text: string;
}

@Entity('twitter_send_dm_reaction')
export class TwitterSendDMReactionEntity implements ReactionEntity {
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
  account: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  text: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([TwitterSendDMReactionEntity]), CacheModule],
})
export class TwitterSendDMReaction extends Reaction<TwitterSendDMReactionDTO, TwitterSendDMReactionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(TwitterSendDMReactionEntity)
    private readonly repository: Repository<TwitterSendDMReactionEntity>,
  ) {
    super();
  }

  async apply(config: TwitterSendDMReactionEntity): Promise<ReactionResult> {
    let twitter;
    
    try {
      twitter = await createTwitter(this.cacheService, config.owner.id);
    } catch (e) {
      return 'missing_credentials';
    }

    let recipientId: string;

    if (await this.cacheService.hasStoredState(null, 'twitter', `${config.account}-id`)) {
      recipientId = await this.cacheService.getStoredState(null, 'twitter', `${config.account}-id`);
    } else {
      let found = await getTwitterUser(this.cacheService, config.owner.id, config.account);

      await this.cacheService.storeState(null, 'twitter', `${config.account}-id`, found.id_str);
      recipientId = found.id_str;
    }

    await twitter.post('direct_messages/events/new', {
      event: {
        type: 'message_create',
        message_create: {
          target: {
            recipient_id: recipientId,
          },
          message_data: {
            text: config.text,
          },
        },
      },
    } as Twit.Params);
  }

  get service(): string {
    return 'twitter';
  }

  get name(): string {
    return 'Send DM';
  }

  get description(): string {
    return 'Send a Twitter direct message';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'account', name: 'Account',
          description: 'Username of the recipient',
        },
        {
          kind: 'text', formId: 'text', name: 'Text',
          description: 'Text to send in the message',
        },
      ],
    };
  }

  dtoToEntity(dto: TwitterSendDMReactionDTO): DeepPartial<TwitterSendDMReactionEntity> {
    return {
      account: dto.account,
      text: dto.text,
    };
  }

  createTestEntity(testOwner: User): TwitterSendDMReactionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      account: 'IamBlueSlime',
      text: 'Hello from AREA!',
    };
  }

  get entityRepository(): Repository<TwitterSendDMReactionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<TwitterSendDMReactionDTO> {
    return TwitterSendDMReactionDTO;
  }

  get reactionName(): string {
    return 'twitter-send-dm';
  }

  get authTokenProvider(): string | null {
    return 'twitter';
  }
}
