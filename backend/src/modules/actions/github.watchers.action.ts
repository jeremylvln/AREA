import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { Expose } from 'class-transformer';
import { Type, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import { IsComparison } from 'common/decorators/is-in-enum.decorator';
import { COMPARISON_SYMBOLS, COMPARISON_FORM, validateComparison } from 'modules/utils/comparison.utils';
import { CacheService } from 'cache/cache.service';
import { Octokit } from '@octokit/rest';
import { CacheModule } from 'cache/cache.module';

class GitHubWatchersActionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  repositoryOwner: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  repositoryName: string;

  @IsInt()
  @Min(0)
  @Expose()
  watchers: number;

  @IsNotEmpty()
  @IsString()
  @IsComparison()
  @Expose()
  comparison: string;
}

@Entity('github_watchers_action')
export class GitHubWatchersActionEntity implements ActionEntity {
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
  repositoryOwner: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  repositoryName: string;

  @Column({
    type: 'integer',
    unsigned: true,
    nullable: false,
  })
  watchers: number;

  @Column({
    type: 'enum',
    enum: COMPARISON_SYMBOLS,
    nullable: false,
  })
  comparison: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([GitHubWatchersActionEntity]), CacheModule],
})
export class GitHubWatchersAction extends Action<GitHubWatchersActionDTO, GitHubWatchersActionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(GitHubWatchersActionEntity)
    private readonly repository: Repository<GitHubWatchersActionEntity>,
  ) {
    super();
  }

  async test(config: GitHubWatchersActionEntity): Promise<ActionResult> {
    if (!await this.cacheService.hasStoredUserToken(config.owner.id, 'github')) {
      return 'missing_credentials';
    }

    const gh = new Octokit({
      auth: await this.cacheService.getStoredUserToken(config.owner.id, 'github'),
    });

    const repo = await gh.repos.get({
      owner: config.repositoryOwner,
      repo: config.repositoryName,
    });

    return validateComparison(repo.data.watchers_count, config.comparison, config.watchers);
  }

  get service(): string {
    return 'github';
  }

  get name(): string {
    return 'Watchers';
  }

  get description(): string {
    return 'Trigger a task when the watchers of a repository match a criteria';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'repositoryOwner', name: 'Repository owner',
          description: 'Username or organization name owning the repository',
        },
        {
          kind: 'text', formId: 'repositoryName', name: 'Repository name',
          description: 'Repository name',
        },
        {
          kind: 'number', formId: 'watchers', name: 'Number of watchers',
          description: 'Number of watchers to use during the comparison', minValue: 0,
        },
        {
          kind: 'select', formId: 'comparison', name: 'Comparison',
          description: 'Mathematical comparison to execute on the watcher number', choices: COMPARISON_FORM,
        },
      ],
    };
  }

  dtoToEntity(dto: GitHubWatchersActionDTO): DeepPartial<GitHubWatchersActionEntity> {
    return {
      repositoryOwner: dto.repositoryOwner,
      repositoryName: dto.repositoryName,
      watchers: dto.watchers,
      comparison: dto.comparison,
    };
  }

  createTestEntity(testOwner: User): GitHubWatchersActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      repositoryOwner: 'IamBlueSlime',
      repositoryName: 'Minecrate',
      watchers: 10,
      comparison: '>=',
    };
  }

  get entityRepository(): Repository<GitHubWatchersActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<GitHubWatchersActionDTO> {
    return GitHubWatchersActionDTO;
  }

  get actionName(): string {
    return 'github-watchers';
  }

  get authTokenProvider(): string | null {
    return 'github';
  }
}
