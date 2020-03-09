import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { Expose } from 'class-transformer';
import { Type, Module, Logger } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Octokit } from '@octokit/rest';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import { IsComparison } from 'common/decorators/is-in-enum.decorator';
import { COMPARISON_SYMBOLS, COMPARISON_FORM, validateComparison } from 'modules/utils/comparison.utils';
import { CacheService } from 'cache/cache.service';
import { CacheModule } from 'cache/cache.module';

class GitHubForksActionDTO {
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
  forks: number;

  @IsNotEmpty()
  @IsString()
  @IsComparison()
  @Expose()
  comparison: string;
}

@Entity('github_forks_action')
export class GitHubForksActionEntity implements ActionEntity {
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
  forks: number;

  @Column({
    type: 'enum',
    enum: COMPARISON_SYMBOLS,
    nullable: false,
  })
  comparison: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([GitHubForksActionEntity]), CacheModule],
})
export class GitHubForksAction extends Action<GitHubForksActionDTO, GitHubForksActionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(GitHubForksActionEntity)
    private readonly repository: Repository<GitHubForksActionEntity>,
  ) {
    super();
  }

  async test(config: GitHubForksActionEntity): Promise<ActionResult> {
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

    return validateComparison(repo.data.forks_count, config.comparison, config.forks);
  }

  get service(): string {
    return 'github';
  }

  get name(): string {
    return 'Forks';
  }

  get description(): string {
    return 'Trigger a task when the forks of a repository match a criteria';
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
          kind: 'number', formId: 'forks', name: 'Number of forks',
          description: 'Number of forks to use during the comparison', minValue: 0,
        },
        {
          kind: 'select', formId: 'comparison', name: 'Comparison',
          description: 'Mathematical comparison to execute on the watcher number', choices: COMPARISON_FORM,
        },
      ],
    };
  }

  dtoToEntity(dto: GitHubForksActionDTO): DeepPartial<GitHubForksActionEntity> {
    return {
      repositoryOwner: dto.repositoryOwner,
      repositoryName: dto.repositoryName,
      forks: dto.forks,
      comparison: dto.comparison,
    };
  }

  createTestEntity(testOwner: User): GitHubForksActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      repositoryOwner: 'IamBlueSlime',
      repositoryName: 'Minecrate',
      forks: 10,
      comparison: '>=',
    };
  }

  get entityRepository(): Repository<GitHubForksActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<GitHubForksActionDTO> {
    return GitHubForksActionDTO;
  }

  get actionName(): string {
    return 'github-forks';
  }

  get authTokenProvider(): string | null {
    return 'github';
  }
}
