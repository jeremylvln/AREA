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

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

class StockStockChangeActionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  stock: string;
}

@Entity('stock_stock_change_action')
export class StockStockChangeActionEntity implements ActionEntity {
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
  stock: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([StockStockChangeActionEntity]), CacheModule],
})
export class StockStockChangeAction extends Action<StockStockChangeActionDTO, StockStockChangeActionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(StockStockChangeActionEntity)
    private readonly repository: Repository<StockStockChangeActionEntity>,
  ) {
    super();
  }

  async test(config: StockStockChangeActionEntity): Promise<ActionResult> {
    const alphaVantage = AlphaVantage({
      key: API_KEY,
    });

    const res = await alphaVantage.data.daily(config.stock);
    const latest = res['Meta Data']['3. Last Refreshed'];
    const rate = res['Time Series (Daily)'][latest]['4. close'];

    if (!await this.cacheService.hasStoredState(null, 'stock', `${config.stock}-${latest}-close`)) {
      await this.cacheService.storeState(null, 'stock', `${config.stock}-${latest}-close`, rate);
      return false;
    }

    const saved = await this.cacheService.getStoredState(null, 'stock', `${config.stock}-${latest}-close`);
    await this.cacheService.storeState(null, 'stock', `${config.stock}-${latest}-close`, rate);
    return rate !== saved;
  }

  get service(): string {
    return 'stock';
  }

  get name(): string {
    return 'Stock Change';
  }

  get description(): string {
    return 'Trigger a task when a stock change is detected';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'stock', name: 'Stock',
          description: 'Stock to monitor',
        },
      ],
    };
  }

  dtoToEntity(dto: StockStockChangeActionDTO): DeepPartial<StockStockChangeActionEntity> {
    return {
      stock: dto.stock,
    };
  }

  createTestEntity(testOwner: User): StockStockChangeActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      stock: 'AAPL',
    };
  }

  get entityRepository(): Repository<StockStockChangeActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<StockStockChangeActionDTO> {
    return StockStockChangeActionDTO;
  }

  get actionName(): string {
    return 'stock-stock-change';
  }
}
