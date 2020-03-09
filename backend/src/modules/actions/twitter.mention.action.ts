import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { Type, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import { CacheModule } from 'cache/cache.module';
import { CacheService } from 'cache/cache.service';
import { createTwitter } from 'modules/utils/twitter.utils';

class TwitterMentionActionDTO {}

@Entity('twitter_new_mention_action')
export class TwitterMentionActionEntity implements ActionEntity {
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
}

@Module({
  imports: [TypeOrmModule.forFeature([TwitterMentionActionEntity]), CacheModule],
})
export class TwitterMentionAction extends Action<TwitterMentionActionDTO, TwitterMentionActionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(TwitterMentionActionEntity)
    private readonly repository: Repository<TwitterMentionActionEntity>,
  ) {
    super();
  }

  async test(config: TwitterMentionActionEntity): Promise<ActionResult> {
    let twitter;
    
    try {
      twitter = await createTwitter(this.cacheService, config.owner.id);
    } catch (e) {
      return 'missing_credentials';
    }

    let now = (await twitter.get('statuses/mentions_timeline.json', {
      count: 1,
    })).data[0];

    if (!(await this.cacheService.hasStoredState(config.owner.id, 'twitter', 'last-mention'))) {
      await this.cacheService.storeState(
        config.owner.id, 'twitter', 'last-mention', now.id_str);
      return false;
    }

    const saved = await this.cacheService.getStoredState(config.owner.id, 'twitter', 'last-mention');
    
    if (now.id_str !== saved) {
      await this.cacheService.storeState(config.owner.id, 'twitter', 'last-mention', now.id_str);
      return true;
    }

    return false;
  }

  get service(): string {
    return 'twitter';
  }

  get name(): string {
    return 'Mention';
  }

  get description(): string {
    return 'Trigger a task when the account got a new mention';
  }

  get form(): Form {
    return {
      inputs: [],
    };
  }

  dtoToEntity(): DeepPartial<TwitterMentionActionEntity> {
    return {};
  }

  createTestEntity(testOwner: User): TwitterMentionActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
    };
  }

  get entityRepository(): Repository<TwitterMentionActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<TwitterMentionActionDTO> {
    return TwitterMentionActionDTO;
  }

  get actionName(): string {
    return 'twitter-mention';
  }

  get authTokenProvider(): string | null {
    return 'twitter';
  }
}