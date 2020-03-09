import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Repository,
} from 'typeorm';
import { Type, Module, HttpModule, HttpService } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import { CacheService } from 'cache/cache.service';
import { CacheModule } from 'cache/cache.module';
import { createEpitechClient, EpitechClient } from 'modules/utils/epitech.utils';

class EpitechGradeActionDTO {}

@Entity('epitech_grade_action')
export class EpitechGradeActionEntity implements ActionEntity {
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
  imports: [TypeOrmModule.forFeature([EpitechGradeActionEntity]), CacheModule, HttpModule],
})
export class EpitechGradeAction extends Action<EpitechGradeActionDTO, EpitechGradeActionEntity> {
  constructor(
    private readonly cacheService: CacheService,
    private readonly httpService: HttpService,

    @InjectRepository(EpitechGradeActionEntity)
    private readonly repository: Repository<EpitechGradeActionEntity>,
  ) {
    super();
  }

  async test(config: EpitechGradeActionEntity): Promise<ActionResult> {
    let epitech: EpitechClient;

    try {
      epitech: await createEpitechClient(this.cacheService, config.owner.id, this.httpService);
    } catch (e) {
      return 'missing_credentials';
    }

    const now = (await epitech.getGrades())[0];

    if (!await this.cacheService.hasStoredState(config.owner.id, 'epitech', 'last-grade')) {
      await this.cacheService.storeState(config.owner.id, 'intranet-epitech', 'last-grade', now.date);
      return false;
    }

    const saved = await this.cacheService.getStoredState(config.owner.id, 'intranet-epitech', 'last-grade');
    await this.cacheService.storeState(config.owner.id, 'intranet-epitech', 'last-grade', now.date);

    return now.date !== saved;
  }

  get service(): string {
    return 'epitech';
  }

  get name(): string {
    return 'New grade';
  }

  get description(): string {
    return 'Trigger a task when a grade is added to the connected user';
  }

  get form(): Form {
    return {
      inputs: [],
    };
  }

  dtoToEntity(dto: EpitechGradeActionDTO): DeepPartial<EpitechGradeActionEntity> {
    return {};
  }

  createTestEntity(testOwner: User): EpitechGradeActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
    };
  }

  get entityRepository(): Repository<EpitechGradeActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<EpitechGradeActionDTO> {
    return EpitechGradeActionDTO;
  }

  get actionName(): string {
    return 'epitech-grade';
  }

  get authTokenProvider(): string | null {
    return 'epitech';
  }
}
