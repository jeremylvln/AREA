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

class GitHubStarsActionDTO {
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
  stars: number;

  @IsNotEmpty()
  @IsString()
  @IsComparison()
  @Expose()
  comparison: string;
}

@Entity('github_stars_action')
export class GitHubStarsActionEntity implements ActionEntity {
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
  stars: number;

  @Column({
    type: 'enum',
    enum: COMPARISON_SYMBOLS,
    nullable: false,
  })
  comparison: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([GitHubStarsActionEntity]), CacheModule],
})
export class GitHubStarsAction extends Action<GitHubStarsActionDTO, GitHubStarsActionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(GitHubStarsActionEntity)
    private readonly repository: Repository<GitHubStarsActionEntity>,
  ) {
    super();
  }

  async test(config: GitHubStarsActionEntity): Promise<ActionResult> {
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

    return validateComparison(repo.data.stargazers_count, config.comparison, config.stars);
  }

  get service(): string {
    return 'github';
  }

  get name(): string {
    return 'Stars';
  }

  get description(): string {
    return 'Trigger a task when the stars of a repository match a criteria';
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
          kind: 'number', formId: 'stars', name: 'Number of stars',
          description: 'Number of stars to use during the comparison', minValue: 0,
        },
        {
          kind: 'select', formId: 'comparison', name: 'Comparison',
          description: 'Mathematical comparison to execute on the watcher number', choices: COMPARISON_FORM,
        },
      ],
    };
  }

  dtoToEntity(dto: GitHubStarsActionDTO): DeepPartial<GitHubStarsActionEntity> {
    return {
      repositoryOwner: dto.repositoryOwner,
      repositoryName: dto.repositoryName,
      stars: dto.stars,
      comparison: dto.comparison,
    };
  }

  createTestEntity(testOwner: User): GitHubStarsActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      repositoryOwner: 'IamBlueSlime',
      repositoryName: 'Minecrate',
      stars: 10,
      comparison: '>=',
    };
  }

  get entityRepository(): Repository<GitHubStarsActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<GitHubStarsActionDTO> {
    return GitHubStarsActionDTO;
  }

  get actionName(): string {
    return 'github-stars';
  }

  get authTokenProvider(): string | null {
    return 'github';
  }
}
