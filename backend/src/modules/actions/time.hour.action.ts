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
  
  class TimeHourActionDTO {
    @IsInt()
    @Min(0)
    @Max(23)
    @Expose()
    hours: number;

    @IsInt()
    @Min(0)
    @Max(59)
    @Expose()
    minutes: number;
  }
  
  @Entity('time_hour_action')
  export class TimeHourActionEntity implements ActionEntity {
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
    imports: [TypeOrmModule.forFeature([TimeHourActionEntity])],
  })
  export class TimeHourAction extends Action<TimeHourActionDTO, TimeHourActionEntity> {
    constructor(
      @InjectRepository(TimeHourActionEntity)
      private readonly repository: Repository<TimeHourActionEntity>,
    ) {
      super();
    }
  
    async test(config: TimeHourActionEntity): Promise<ActionResult> {
      const now = new Date();
      const stored = new Date(config.date);

      return Promise.resolve(now.getUTCHours() == stored.getUTCHours()
        && now.getUTCMinutes() == stored.getUTCMinutes());
    }
  
    get service(): string {
      return 'time';
    }
  
    get name(): string {
      return 'Hour';
    }
  
    get description(): string {
      return 'Trigger a task when the time is now';
    }
  
    get form(): Form {
      return {
        inputs: [
          {
            kind: 'number', formId: 'hours', name: 'Hours',
            description: 'Hours of the time', minValue: 0, maxValue: 23,
          },
          {
            kind: 'number', formId: 'minutes', name: 'Minutes',
            description: 'Minutes of the time', minValue: 0, maxValue: 59,
          },
        ],
      };
    }
  
    dtoToEntity(dto: TimeHourActionDTO): DeepPartial<TimeHourActionEntity> {
      const date = new Date();
      date.setUTCHours(dto.hours);
      date.setUTCMinutes(dto.minutes);

      return {
        date: date.toString(),
      };
    }
  
    createTestEntity(testOwner: User): TimeHourActionEntity {
      const date = new Date();
      date.setMinutes(date.getMinutes() + 1);

      return {
        instanceId: '1',
        owner: testOwner,
        date: date.toString(),
      };
    }

    get entityRepository(): Repository<TimeHourActionEntity> {
      return this.repository;
    }
  
    get dtoClass(): Type<TimeHourActionDTO> {
      return TimeHourActionDTO;
    }
  
    get actionName(): string {
      return 'time-hour';
    }
  }
  