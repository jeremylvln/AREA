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
import * as graph from '@microsoft/microsoft-graph-client';

class TodoCreateTaskReactionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  subject: string;
}

@Entity('toto_create_task_reaction')
export class TodoCreateTaskReactionEntity implements ReactionEntity {
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
  subject: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([TodoCreateTaskReactionEntity]), CacheModule],
})
export class TodoCreateTaskReaction extends Reaction<TodoCreateTaskReactionDTO, TodoCreateTaskReactionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(TodoCreateTaskReactionEntity)
    private readonly repository: Repository<TodoCreateTaskReactionEntity>,
  ) {
    super();
  }

  async apply(config: TodoCreateTaskReactionEntity): Promise<ReactionResult> {
    if (!(await this.cacheService.hasStoredUserToken(config.owner.id, 'azuread'))) {
      return 'missing_credentials';
    }

    const accessToken = await this.cacheService.getStoredUserToken(config.owner.id, 'azuread');

    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    await client
      .api('/me/outlook/tasks')
      .version('beta')
      .post({
        subject: config.subject,
      });
  }

  get service(): string {
    return 'microsoft-to-do';
  }

  get name(): string {
    return 'Create Task';
  }

  get description(): string {
    return 'Create a to-do task';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'subject', name: 'Subject',
          description: 'Subject of the task',
        },
      ],
    };
  }

  dtoToEntity(dto: TodoCreateTaskReactionDTO): DeepPartial<TodoCreateTaskReactionEntity> {
    return {
      subject: dto.subject,
    };
  }

  createTestEntity(testOwner: User): TodoCreateTaskReactionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      subject: 'Hello from AREA!',
    };
  }

  get entityRepository(): Repository<TodoCreateTaskReactionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<TodoCreateTaskReactionDTO> {
    return TodoCreateTaskReactionDTO;
  }

  get reactionName(): string {
    return 'todo-create-task';
  }

  get authTokenProvider(): string | null {
    return 'azuread';
  }
}
