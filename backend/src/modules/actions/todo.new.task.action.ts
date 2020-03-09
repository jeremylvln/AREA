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

class TodoNewTaskActionDTO {}

@Entity('todo_new_task_action')
export class TodoNewTaskActionEntity implements ActionEntity {
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
  imports: [TypeOrmModule.forFeature([TodoNewTaskActionEntity]), CacheModule],
})
export class TodoNewTaskAction extends Action<TodoNewTaskActionDTO, TodoNewTaskActionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(TodoNewTaskActionEntity)
    private readonly repository: Repository<TodoNewTaskActionEntity>,
  ) {
    super();
  }

  async test(config: TodoNewTaskActionEntity): Promise<ActionResult> {
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
      .select('id,lastModifiedDateTime')
      .orderby('lastModifiedDateTime DESC')
      .get();

    if (result.value.length === 0) {
      return;
    }

    if (!await this.cacheService.hasStoredState(config.owner.id, 'todo', 'last-todo')) {
      await this.cacheService.storeState(config.owner.id, 'todo', 'last-todo', result.value[0].id);
      return false;
    }

    const saved = await this.cacheService.getStoredState(config.owner.id, 'todo', 'last-todo');
    await this.cacheService.storeState(config.owner.id, 'todo', 'last-todo', result.value[0].id);
    return result.value[0].id !== saved;
  }

  get service(): string {
    return 'microsoft-to-do';
  }

  get name(): string {
    return 'New Task';
  }

  get description(): string {
    return 'Trigger a task is created';
  }

  get form(): Form {
    return {
      inputs: [],
    };
  }

  dtoToEntity(dto: TodoNewTaskActionDTO): DeepPartial<TodoNewTaskActionEntity> {
    return {};
  }

  createTestEntity(testOwner: User): TodoNewTaskActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
    };
  }

  get entityRepository(): Repository<TodoNewTaskActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<TodoNewTaskActionDTO> {
    return TodoNewTaskActionDTO;
  }

  get actionName(): string {
    return 'todo-new-task';
  }

  get authTokenProvider(): string | null {
    return 'azuread';
  }
}
