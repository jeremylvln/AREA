import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { Type, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { ReactionEntity, Reaction, ReactionResult } from '../modules.reaction';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import { CacheModule } from 'cache/cache.module';
import { CacheService } from 'cache/cache.service';
import { createTwitter } from 'modules/utils/twitter.utils';

class TwitterSendTweetReactionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  text: string;
}

@Entity('twitter_send_tweet_reaction')
export class TwitterSendTweetReactionEntity implements ReactionEntity {
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
  text: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([TwitterSendTweetReactionEntity]), CacheModule],
})
export class TwitterSendTweetReaction extends Reaction<TwitterSendTweetReactionDTO, TwitterSendTweetReactionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(TwitterSendTweetReactionEntity)
    private readonly repository: Repository<TwitterSendTweetReactionEntity>,
  ) {
    super();
  }

  async apply(config: TwitterSendTweetReactionEntity): Promise<ReactionResult> {
    let twitter;
    
    try {
      twitter = await createTwitter(this.cacheService, config.owner.id);
    } catch (e) {
      return 'missing_credentials';
    }

    await twitter.post('statuses/update', {
      status: config.text,
    });
  }

  get service(): string {
    return 'twitter';
  }

  get name(): string {
    return 'Send Tweet';
  }

  get description(): string {
    return 'Send a Tweet';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'text', name: 'Text',
          description: 'Text to send in the message',
        },
      ],
    };
  }

  dtoToEntity(dto: TwitterSendTweetReactionDTO): DeepPartial<TwitterSendTweetReactionEntity> {
    return {
      text: dto.text,
    };
  }

  createTestEntity(testOwner: User): TwitterSendTweetReactionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      text: 'Hello from AREA!',
    };
  }

  get entityRepository(): Repository<TwitterSendTweetReactionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<TwitterSendTweetReactionDTO> {
    return TwitterSendTweetReactionDTO;
  }

  get reactionName(): string {
    return 'twitter-send-tweet';
  }

  get authTokenProvider(): string | null {
    return 'twitter';
  }
}
