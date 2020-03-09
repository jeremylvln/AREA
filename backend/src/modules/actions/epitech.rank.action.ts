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

class EpitechRankActionDTO {}

@Entity('epitech_rank_action')
export class EpitechRankActionEntity implements ActionEntity {
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
  imports: [TypeOrmModule.forFeature([EpitechRankActionEntity]), CacheModule, HttpModule],
})
export class EpitechRankAction extends Action<EpitechRankActionDTO, EpitechRankActionEntity> {
  constructor(
    private readonly cacheService: CacheService,
    private readonly httpService: HttpService,

    @InjectRepository(EpitechRankActionEntity)
    private readonly repository: Repository<EpitechRankActionEntity>,
  ) {
    super();
  }

  async test(config: EpitechRankActionEntity): Promise<ActionResult> {
    let epitech: EpitechClient;

    try {
      await createEpitechClient(this.cacheService, config.owner.id, this.httpService);
    } catch (e) {
      return 'missing_credentials';
    }

    const now = (await epitech.getSubscribedModules()).map((subscribedModule) => ({
      code: subscribedModule.codemodule,
      year: subscribedModule.scolaryear,
      rank: subscribedModule.grade,
    }));

    const toSave = JSON.stringify(now);

    if (!await this.cacheService.hasStoredState(config.owner.id, 'epitech', 'subscribed-modules')) {
      await this.cacheService.storeState(config.owner.id, 'epitech', 'subscribed-modules', toSave);
      return false;
    }

    const saved: {
      code: string;
      year: number;
      rank: string;
    }[] = JSON.parse(await this.cacheService.getStoredState(config.owner.id, 'epitech', 'subscribed-modules'));
    await this.cacheService.storeState(config.owner.id, 'epitech', 'subscribed-modules', toSave);

    const found = now.findIndex((subscribedModule) => {
      const save = saved.find((savedModule) =>
        savedModule.code === subscribedModule.code && savedModule.year === subscribedModule.year
      );

      if (!save) {
        return false;
      }

      return save.rank !== subscribedModule.rank;
    });

    return found !== -1;
  }

  get service(): string {
    return 'epitech';
  }

  get name(): string {
    return 'New rank';
  }

  get description(): string {
    return 'Trigger a task when a rank is added to the connected user';
  }

  get form(): Form {
    return {
      inputs: [],
    };
  }

  dtoToEntity(dto: EpitechRankActionDTO): DeepPartial<EpitechRankActionEntity> {
    return {};
  }

  createTestEntity(testOwner: User): EpitechRankActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
    };
  }

  get entityRepository(): Repository<EpitechRankActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<EpitechRankActionDTO> {
    return EpitechRankActionDTO;
  }

  get actionName(): string {
    return 'epitech-rank';
  }

  get authTokenProvider(): string | null {
    return 'epitech';
  }
}
