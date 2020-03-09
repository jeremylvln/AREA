import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { Type, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import { CacheModule } from '../../cache/cache.module';
import { CacheService } from '../../cache/cache.service';
import { createTwitter } from '../utils/twitter.utils';

class TwitterDMActionDTO {}

@Entity('twitter_new_mention_action')
export class TwitterDMActionEntity implements ActionEntity {
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
  imports: [TypeOrmModule.forFeature([TwitterDMActionEntity]), CacheModule],
})
export class TwitterDMAction extends Action<TwitterDMActionDTO, TwitterDMActionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(TwitterDMActionEntity)
    private readonly repository: Repository<TwitterDMActionEntity>,
  ) {
    super();
  }

  async test(config: TwitterDMActionEntity): Promise<ActionResult> {
    let twitter;
    
    try {
      twitter =await createTwitter(this.cacheService, config.owner.id);
    } catch (e) {
      return 'missing_credentials';
    }

    const now = ((await twitter.get('direct_messages/events/list', {
      count: 1,
    })).data as any).events;

    if (now.length === 0) {
      return false;
    }

    if (!(await this.cacheService.hasStoredState(config.owner.id, 'twitter', 'last-dm'))) {
      await this.cacheService.storeState(
        config.owner.id, 'twitter', 'last-dm', now[0].id);
      return false;
    }

    const saved = await this.cacheService.getStoredState(config.owner.id, 'twitter', 'last-dm');
    
    if (now[0].id !== saved) {
      await this.cacheService.storeState(config.owner.id, 'twitter', 'last-dm', now[0].id);
      return true;
    }

    return false;
  }

  get service(): string {
    return 'twitter';
  }

  get name(): string {
    return 'Direct Message';
  }

  get description(): string {
    return 'Trigger a task when the account got a new direct message';
  }

  get form(): Form {
    return {
      inputs: [],
    };
  }

  dtoToEntity(dto: TwitterDMActionDTO): DeepPartial<TwitterDMActionEntity> {
    return {};
  }

  createTestEntity(testOwner: User): TwitterDMActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
    };
  }

  get entityRepository(): Repository<TwitterDMActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<TwitterDMActionDTO> {
    return TwitterDMActionDTO;
  }

  get actionName(): string {
    return 'twitter-dm';
  }

  get authTokenProvider(): string | null {
    return 'twitter';
  }
}