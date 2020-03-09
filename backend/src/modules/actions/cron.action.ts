import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { Type, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { parseExpression } from 'cron-parser';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import { CacheModule } from 'cache/cache.module';
import { CacheService } from 'cache/cache.service';

class CronActionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  cron: string;
}

@Entity('cron_action')
export class CronActionEntity implements ActionEntity {
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
    length: 20,
    nullable: false,
  })
  cron: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([CronActionEntity]), CacheModule],
})
export class CronAction extends Action<CronActionDTO, CronActionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(CronActionEntity)
    private readonly repository: Repository<CronActionEntity>,
  ) {
    super();
  }

  async test(config: CronActionEntity): Promise<ActionResult> {
    const interval = parseExpression(config.cron);
    const nextTrigger = interval.next();

    if (!(await this.cacheService.hasStoredState(config.owner.id, 'cron', `${config.instanceId}-next-trigger`))) {
      await this.cacheService.storeState(config.owner.id, 'cron', `${config.instanceId}-next-trigger`, nextTrigger.getTime());
      return false;
    }

    const stored = await this.cacheService.getStoredState(config.owner.id, 'cron', `${config.instanceId}-next-trigger`);

    if (new Date().getTime() > stored) {
      await this.cacheService.storeState(config.owner.id, 'cron', `${config.instanceId}-next-trigger`, nextTrigger.getTime());
      return true;
    }
    
    return false;
  }

  get service(): string {
    return 'cron';
  }

  get name(): string {
    return 'Cron';
  }

  get description(): string {
    return 'Trigger a task when the cron is validated';
  }

  get form(): Form {
    return {
      inputs: [
        { kind: 'text', formId: 'cron', name: 'Cron', description: 'Cron schedule expression' },
      ],
    };
  }

  dtoToEntity(dto: CronActionDTO): DeepPartial<CronActionEntity> {
    return {
      cron: dto.cron,
    };
  }

  createTestEntity(testOwner: User): CronActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      cron: '*/10 * * * *',
    };
  }

  get entityRepository(): Repository<CronActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<CronActionDTO> {
    return CronActionDTO;
  }

  get actionName(): string {
    return 'cron';
  }
}
