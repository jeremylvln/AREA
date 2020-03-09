import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsInt, Min, IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { Type, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import { IsComparison } from 'common/decorators/is-in-enum.decorator';
import { COMPARISON_SYMBOLS, COMPARISON_FORM, validateComparison } from 'modules/utils/comparison.utils';
import { CacheService } from 'cache/cache.service';
import { CacheModule } from 'cache/cache.module';
import { getTwitterUser } from 'modules/utils/twitter.utils';

class TwitterFollowersActionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  account: string;

  @IsInt()
  @Min(0)
  @Expose()
  followers: number;

  @IsNotEmpty()
  @IsString()
  @IsComparison()
  @Expose()
  comparison: string;
}

@Entity('twitter_followers_action')
export class TwitterFollowersActionEntity implements ActionEntity {
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
    type: 'integer',
    unsigned: true,
    nullable: false,
  })
  followers: number;

  @Column({
    type: 'enum',
    enum: COMPARISON_SYMBOLS,
    nullable: false,
  })
  comparison: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([TwitterFollowersActionEntity]), CacheModule],
})
export class TwitterFollowersAction extends Action<TwitterFollowersActionDTO, TwitterFollowersActionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(TwitterFollowersActionEntity)
    private readonly repository: Repository<TwitterFollowersActionEntity>,
  ) {
    super();
  }

  async test(config: TwitterFollowersActionEntity): Promise<ActionResult> {
    try {
      const user = await getTwitterUser(this.cacheService, config.owner.id, config.account);
      return validateComparison(user.followers_count, config.comparison, config.followers);
    } catch (e) {
      return 'missing_credentials';
    }
  }

  get service(): string {
    return 'twitter';
  }

  get name(): string {
    return 'Followers';
  }

  get description(): string {
    return 'Trigger a task when the number of followers trigger a criteria';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'account', name: 'Account',
          description: 'Username of the account to monitor',
        },
        {
          kind: 'number', formId: 'followers', name: 'Number of followers',
          description: 'Number of followers to use during the comparison', minValue: 0,
        },
        {
          kind: 'select', formId: 'comparison', name: 'Comparison',
          description: 'Mathematical comparison to execute on the player number', choices: COMPARISON_FORM,
        },
      ],
    };
  }

  dtoToEntity(dto: TwitterFollowersActionDTO): DeepPartial<TwitterFollowersActionEntity> {
    return {
      account: dto.account,
      followers: dto.followers,
      comparison: dto.comparison,
    };
  }

  createTestEntity(testOwner: User): TwitterFollowersActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      account: 'IamBlueSlime',
      followers: 100,
      comparison: '>',
    };
  }

  get entityRepository(): Repository<TwitterFollowersActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<TwitterFollowersActionDTO> {
    return TwitterFollowersActionDTO;
  }

  get actionName(): string {
    return 'twitter-followers';
  }

  get authTokenProvider(): string | null {
    return 'twitter';
  }
}