import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { Type, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import * as AlphaVantage from 'alphavantage';
import { CacheModule } from 'cache/cache.module';
import { CacheService } from 'cache/cache.service';
import { PHYSICAL_CURRENCIES, PHYSICAL_CURRENCIES_FORM } from 'modules/utils/currency.utils';
import { IsInEnum } from 'common/decorators/is-in-enum.decorator';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

class StockForexChangeActionDTO {
  @IsNotEmpty()
  @IsString()
  @IsInEnum(PHYSICAL_CURRENCIES)
  @Expose()
  from: string;

  @IsNotEmpty()
  @IsString()
  @IsInEnum(PHYSICAL_CURRENCIES)
  @Expose()
  to: string;
}

@Entity('stock_forex_change_action')
export class StockForexChangeActionEntity implements ActionEntity {
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
    type: 'enum',
    enum: PHYSICAL_CURRENCIES,
    nullable: false,
  })
  from: string;

  @Column({
    type: 'enum',
    enum: PHYSICAL_CURRENCIES,
    nullable: false,
  })
  to: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([StockForexChangeActionEntity]), CacheModule],
})
export class StockForexChangeAction extends Action<StockForexChangeActionDTO, StockForexChangeActionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(StockForexChangeActionEntity)
    private readonly repository: Repository<StockForexChangeActionEntity>,
  ) {
    super();
  }

  async test(config: StockForexChangeActionEntity): Promise<ActionResult> {
    const alphaVantage = AlphaVantage({
      key: API_KEY,
    });

    const res = await alphaVantage.forex.rate(config.from, config.to);
    const rate = res['Realtime Currency Exchange Rate']['5. Exchange Rate'];

    if (!await this.cacheService.hasStoredState(null, 'stock', `${config.from}-${config.to}-exchange-rate`)) {
      await this.cacheService.storeState(null, 'stock', `${config.from}-${config.to}-exchange-rate`, rate);
      return false;
    }

    const saved = await this.cacheService.getStoredState(null, 'stock', `${config.from}-${config.to}-exchange-rate`);
    await this.cacheService.storeState(null, 'stock', `${config.from}-${config.to}-exchange-rate`, rate);
    return rate !== saved;
  }

  get service(): string {
    return 'stock';
  }

  get name(): string {
    return 'Forex Change';
  }

  get description(): string {
    return 'Trigger a task when a change in a currency exchange is detected';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'select', formId: 'from', name: 'From',
          description: 'From currency', choices: PHYSICAL_CURRENCIES_FORM
        },
        {
          kind: 'select', formId: 'to', name: 'To',
          description: 'To currency', choices: PHYSICAL_CURRENCIES_FORM
        },
      ],
    };
  }

  dtoToEntity(dto: StockForexChangeActionDTO): DeepPartial<StockForexChangeActionEntity> {
    return {
      from: dto.from,
      to: dto.to,
    };
  }

  createTestEntity(testOwner: User): StockForexChangeActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      from: 'EUR',
      to: 'CAD',
    };
  }

  get entityRepository(): Repository<StockForexChangeActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<StockForexChangeActionDTO> {
    return StockForexChangeActionDTO;
  }

  get actionName(): string {
    return 'stock-forex-change';
  }
}
