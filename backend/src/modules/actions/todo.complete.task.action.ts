import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Repository,
} from 'typeorm';
import { Type, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import { CacheService } from 'cache/cache.service';
import { CacheModule } from 'cache/cache.module';
import * as graph from '@microsoft/microsoft-graph-client';

class TodoCompleteTaskActionDTO {}

@Entity('todo_complete_task_action')
export class TodoCompleteTaskActionEntity implements ActionEntity {
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
  imports: [TypeOrmModule.forFeature([TodoCompleteTaskActionEntity]), CacheModule],
})
export class TodoCompleteTaskAction extends Action<TodoCompleteTaskActionDTO, TodoCompleteTaskActionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(TodoCompleteTaskActionEntity)
    private readonly repository: Repository<TodoCompleteTaskActionEntity>,
  ) {
    super();
  }

  async test(config: TodoCompleteTaskActionEntity): Promise<ActionResult> {
    if (!(await this.cacheService.hasStoredUserToken(config.owner.id, 'azuread'))) {
      return 'missing_credentials';
    }

    const accessToken = await this.cacheService.getStoredUserToken(config.owner.id, 'azuread');

    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    const result = await client
      .api('/me/outlook/tasks')
      .version('beta')
      .top(1)
      .select('id,status,lastModifiedDateTime')
      .orderby('lastModifiedDateTime DESC')
      .filter('status%20eq%20%27completed%27')
      .get();

    if (result.value.length === 0) {
      return false;
    }

    if (!await this.cacheService.hasStoredState(config.owner.id, 'todo', 'last-todo-completed')) {
      await this.cacheService.storeState(config.owner.id, 'todo', 'last-todo-completed', result.value[0].id);
      return true;
    }

    const saved = await this.cacheService.getStoredState(config.owner.id, 'todo', 'last-todo-completed');
    await this.cacheService.storeState(config.owner.id, 'todo', 'last-todo-completed', result.value[0].id);
    return result.value[0].id !== saved;
  }

  get service(): string {
    return 'microsoft-to-do';
  }

  get name(): string {
    return 'Completed Task';
  }

  get description(): string {
    return 'Trigger a task is completed';
  }

  get form(): Form {
    return {
      inputs: [],
    };
  }

  dtoToEntity(dto: TodoCompleteTaskActionDTO): DeepPartial<TodoCompleteTaskActionEntity> {
    return {};
  }

  createTestEntity(testOwner: User): TodoCompleteTaskActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
    };
  }

  get entityRepository(): Repository<TodoCompleteTaskActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<TodoCompleteTaskActionDTO> {
    return TodoCompleteTaskActionDTO;
  }

  get actionName(): string {
    return 'todo-complete-task';
  }

  get authTokenProvider(): string | null {
    return 'azuread';
  }
}
