import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { Type, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import { CacheModule } from 'cache/cache.module';
import { CacheService } from 'cache/cache.service';
import { getTwitterUser } from 'modules/utils/twitter.utils';

class TwitterNewFollowerActionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  account: string;
}

@Entity('twitter_new_follower_action')
export class TwitterNewFollowerActionEntity implements ActionEntity {
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
}

@Module({
  imports: [TypeOrmModule.forFeature([TwitterNewFollowerActionEntity]), CacheModule],
})
export class TwitterNewFollowerAction extends Action<TwitterNewFollowerActionDTO, TwitterNewFollowerActionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(TwitterNewFollowerActionEntity)
    private readonly repository: Repository<TwitterNewFollowerActionEntity>,
  ) {
    super();
  }

  async test(config: TwitterNewFollowerActionEntity): Promise<ActionResult> {    
    if (!await this.cacheService.hasStoredState(null, 'twitter', `${config.account}-followers`)) {
      try {
        await getTwitterUser(this.cacheService, config.owner.id, config.account);
        return false;
      } catch (e) {
        return 'missing_credentials';
      }
    }

    try {
      const now = await getTwitterUser(this.cacheService, config.owner.id, config.account);
      const saved = Number(await this.cacheService.getStoredState(null, 'twitter', `${config.account}-followers`));
      return now.followers_count > saved;
    } catch (e) {
      return 'missing_credentials';
    }
  }

  get service(): string {
    return 'twitter';
  }

  get name(): string {
    return 'New Follower';
  }

  get description(): string {
    return 'Trigger a task when the account got a new follower';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'account', name: 'Account',
          description: 'Username of the account to monitor',
        },
      ],
    };
  }

  dtoToEntity(dto: TwitterNewFollowerActionDTO): DeepPartial<TwitterNewFollowerActionEntity> {
    return {
      account: dto.account,
    };
  }

  createTestEntity(testOwner: User): TwitterNewFollowerActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      account: 'IamBlueSlime',
    };
  }

  get entityRepository(): Repository<TwitterNewFollowerActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<TwitterNewFollowerActionDTO> {
    return TwitterNewFollowerActionDTO;
  }

  get actionName(): string {
    return 'twitter-new-follower';
  }

  get authTokenProvider(): string | null {
    return 'twitter';
  }
}