import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsInt, Min, Max } from 'class-validator';
import { Expose } from 'class-transformer';
import { Type, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';

class TimeDateActionDTO {
  @IsInt()
  @Min(1)
  @Max(31)
  @Expose()
  day: number;

  @IsInt()
  @Min(1)
  @Max(12)
  @Expose()
  month: number;

  @IsInt()
  @Min(1970)
  @Expose()
  year: number;
}

@Entity('time_date_action')
export class TimeDateActionEntity implements ActionEntity {
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
  date: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([TimeDateActionEntity])],
})
export class TimeDateAction extends Action<TimeDateActionDTO, TimeDateActionEntity> {
  constructor(
    @InjectRepository(TimeDateActionEntity)
    private readonly repository: Repository<TimeDateActionEntity>,
  ) {
    super();
  }

  async test(config: TimeDateActionEntity): Promise<ActionResult> {
    const now = new Date();
    const stored = new Date(config.date);
    
    return Promise.resolve(now.getUTCFullYear() == stored.getUTCFullYear()
      && now.getUTCMonth() == stored.getUTCMonth()
      && now.getUTCDay() == stored.getUTCDay());
  }

  get service(): string {
    return 'time';
  }

  get name(): string {
    return 'Date';
  }

  get description(): string {
    return 'Trigger a task when the date specified is today';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'number', formId: 'day', name: 'Day',
          description: 'Day of the date', minValue: 1, maxValue: 31,
        },
        {
          kind: 'number', formId: 'month', name: 'Month',
          description: 'Day of the date', minValue: 1, maxValue: 31,
        },
        {
          kind: 'number', formId: 'year', name: 'Year',
          description: 'Day of the date', minValue: 1, maxValue: 31,
        },
      ],
    };
  }

  dtoToEntity(dto: TimeDateActionDTO): DeepPartial<TimeDateActionEntity> {
    const date = new Date();
    date.setUTCFullYear(dto.year, dto.month - 1, dto.day);

    return {
      date: date.toString(),
    };
  }

  createTestEntity(testOwner: User): TimeDateActionEntity {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    return {
      instanceId: '1',
      owner: testOwner,
      date: date.toString(),
    };
  }

  get entityRepository(): Repository<TimeDateActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<TimeDateActionDTO> {
    return TimeDateActionDTO;
  }

  get actionName(): string {
    return 'time-date';
  }
}
