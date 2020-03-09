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
import { createTwitter, getTwitterTweet } from 'modules/utils/twitter.utils';

class TwitterRespondTweetReactionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  tweetId: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  text: string;
}

@Entity('twitter_respond_tweet_reaction')
export class TwitterRespondTweetReactionEntity implements ReactionEntity {
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
  tweetId: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  text: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([TwitterRespondTweetReactionEntity]), CacheModule],
})
export class TwitterRespondTweetReaction extends Reaction<TwitterRespondTweetReactionDTO, TwitterRespondTweetReactionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(TwitterRespondTweetReactionEntity)
    private readonly repository: Repository<TwitterRespondTweetReactionEntity>,
  ) {
    super();
  }

  async apply(config: TwitterRespondTweetReactionEntity): Promise<ReactionResult> {
    let twitter;
    
    try {
      twitter = await createTwitter(this.cacheService, config.owner.id);
    } catch (e) {
      return 'missing_credentials';
    }

    const tweet = await getTwitterTweet(this.cacheService, config.owner.id, config.tweetId);
    await twitter.post('statuses/update', {
      in_reply_to_status_id: config.tweetId,
      status: `@${tweet.user.screen_name} ${config.text}`,
    });
  }

  get service(): string {
    return 'twitter';
  }

  get name(): string {
    return 'Respond';
  }

  get description(): string {
    return 'Respond to a tweet';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'tweetId', name: 'Tweet ID',
          description: 'ID of the Tweet where to post the response',
        },
        {
          kind: 'text', formId: 'text', name: 'Text',
          description: 'Text to send in the message',
        },
      ],
    };
  }

  dtoToEntity(dto: TwitterRespondTweetReactionDTO): DeepPartial<TwitterRespondTweetReactionEntity> {
    return {
      tweetId: dto.tweetId,
      text: dto.text,
    };
  }

  createTestEntity(testOwner: User): TwitterRespondTweetReactionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      tweetId: '1231256234575245313',
      text: 'Hello from AREA!',
    };
  }

  get entityRepository(): Repository<TwitterRespondTweetReactionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<TwitterRespondTweetReactionDTO> {
    return TwitterRespondTweetReactionDTO;
  }

  get reactionName(): string {
    return 'twitter-respond-tweet';
  }

  get authTokenProvider(): string | null {
    return 'twitter';
  }
}
