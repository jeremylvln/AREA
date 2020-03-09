import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';
import { Type, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import { CacheService } from 'cache/cache.service';
import { CacheModule } from 'cache/cache.module';
import * as graph from '@microsoft/microsoft-graph-client';

class OutlookMailActionDTO {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Expose()
  from: string;
}

@Entity('outlook_mail_action')
export class OutlookMailActionEntity implements ActionEntity {
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
    nullable: true,
  })
  from: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([OutlookMailActionEntity]), CacheModule],
})
export class OutlookMailAction extends Action<OutlookMailActionDTO, OutlookMailActionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(OutlookMailActionEntity)
    private readonly repository: Repository<OutlookMailActionEntity>,
  ) {
    super();
  }

  async test(config: OutlookMailActionEntity): Promise<ActionResult> {
    if (!(await this.cacheService.hasStoredUserToken(config.owner.id, 'azuread'))) {
      return 'missing_credentials';
      return false;
    }

    const accessToken = await this.cacheService.getStoredUserToken(config.owner.id, 'azuread');

    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    const result = await client
      .api('/me/messages')
      .top(1)
      .select('from,receivedDateTime')
      .orderby('receivedDateTime DESC')
      .get();

    if (result.value.length === 0) {
      return false;
    }

    // if (config.from) {
    //   result.value = result.value.filter((mail) => mail.from === config.from);
    // }

    if (!await this.cacheService.hasStoredState(config.owner.id, 'outlook', 'last-mail')) {
      await this.cacheService.storeState(config.owner.id, 'outlook', 'last-mail', result.value[0].id);
      return false;
    }

    const saved = await this.cacheService.getStoredState(config.owner.id, 'outlook', 'last-mail');
    await this.cacheService.storeState(config.owner.id, 'outlook', 'last-mail', result.value[0].id);
    return result.value[0].id !== saved;
  }

  get service(): string {
    return 'outlook';
  }

  get name(): string {
    return 'Mail';
  }

  get description(): string {
    return 'Trigger a task when a mail is received';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'from', name: 'From',
          description: 'User which whom have sent the mail', optional: true,
        },
      ],
    };
  }

  dtoToEntity(dto: OutlookMailActionDTO): DeepPartial<OutlookMailActionEntity> {
    return {
      from: dto.from,
    };
  }

  createTestEntity(testOwner: User): OutlookMailActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      from: null,
    };
  }

  get entityRepository(): Repository<OutlookMailActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<OutlookMailActionDTO> {
    return OutlookMailActionDTO;
  }

  get actionName(): string {
    return 'outlook-mail';
  }

  get authTokenProvider(): string | null {
    return 'azuread';
  }
}
