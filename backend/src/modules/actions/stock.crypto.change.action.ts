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
import { DIGITAL_CURRENCIES, DIGITAL_CURRENCIES_FORM, BOTH_CURRENCIES_FORM, BOTH_CURRENCIES } from 'modules/utils/currency.utils';
import { IsInEnum } from 'common/decorators/is-in-enum.decorator';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

class StockCryptoChangeActionDTO {
  @IsNotEmpty()
  @IsString()
  @IsInEnum(DIGITAL_CURRENCIES)
  @Expose()
  from: string;

  @IsNotEmpty()
  @IsString()
  @IsInEnum(BOTH_CURRENCIES)
  @Expose()
  to: string;
}

@Entity('stock_crypto_change_action')
export class StockCryptoChangeActionEntity implements ActionEntity {
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
    enum: DIGITAL_CURRENCIES,
    nullable: false,
  })
  from: string;

  @Column({
    type: 'enum',
    enum: BOTH_CURRENCIES,
    nullable: false,
  })
  to: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([StockCryptoChangeActionEntity]), CacheModule],
})
export class StockCryptoChangeAction extends Action<StockCryptoChangeActionDTO, StockCryptoChangeActionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(StockCryptoChangeActionEntity)
    private readonly repository: Repository<StockCryptoChangeActionEntity>,
  ) {
    super();
  }

  async test(config: StockCryptoChangeActionEntity): Promise<ActionResult> {
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
    return 'Cryptocurrency Change';
  }

  get description(): string {
    return 'Trigger a task when a change in a cryptocurrency exchange is detected';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'select', formId: 'from', name: 'From',
          description: 'From currency', choices: DIGITAL_CURRENCIES_FORM,
        },
        {
          kind: 'select', formId: 'to', name: 'To',
          description: 'To currency', choices: BOTH_CURRENCIES_FORM,
        },
      ],
    };
  }

  dtoToEntity(dto: StockCryptoChangeActionDTO): DeepPartial<StockCryptoChangeActionEntity> {
    return {
      from: dto.from,
      to: dto.to,
    };
  }

  createTestEntity(testOwner: User): StockCryptoChangeActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      from: 'BTC',
      to: 'EUR',
    };
  }

  get entityRepository(): Repository<StockCryptoChangeActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<StockCryptoChangeActionDTO> {
    return StockCryptoChangeActionDTO;
  }

  get actionName(): string {
    return 'stock-crypto-change';
  }
}
