import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { Expose } from 'class-transformer';
import { Type, Module, HttpService, HttpModule } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';

class WebsiteDownActionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  url: string;

  @IsBoolean()
  @Expose()
  online: boolean;
}

@Entity('website_down_action')
export class WebsiteDownActionEntity implements ActionEntity {
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
  url: string;

  @Column({
    type: 'boolean',
    nullable: false,
  })
  online: boolean;
}

@Module({
  imports: [TypeOrmModule.forFeature([WebsiteDownActionEntity]), HttpModule],
})
export class WebsiteDownAction extends Action<WebsiteDownActionDTO, WebsiteDownActionEntity> {
  constructor(
    private readonly httpService: HttpService,

    @InjectRepository(WebsiteDownActionEntity)
    private readonly repository: Repository<WebsiteDownActionEntity>,
  ) {
    super();
  }

  async test(config: WebsiteDownActionEntity): Promise<ActionResult> {
    return new Promise<boolean>(async (resolve) => {
      try {
        await this.httpService.get(config.url).toPromise();
        resolve(config.online);
      } catch (e) {
        resolve(!config.online);
      }
    });
  }

  get service(): string {
    return 'website';
  }

  get name(): string {
    return 'Uptime';
  }

  get description(): string {
    return 'Trigger a task when a website is up or down';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'url', name: 'URL',
          description: 'URL of the website to monitor',
        },
        {
          kind: 'checkbox', formId: 'online', name: 'Online?',
          description: 'Whether validate when the website is online or offline',
        },
      ],
    };
  }

  dtoToEntity(dto: WebsiteDownActionDTO): DeepPartial<WebsiteDownActionEntity> {
    return {
      url: dto.url,
      online: dto.online,
    };
  }

  createTestEntity(testOwner: User): WebsiteDownActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      url: 'google.com',
      online: false,
    };
  }

  get entityRepository(): Repository<WebsiteDownActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<WebsiteDownActionDTO> {
    return WebsiteDownActionDTO;
  }

  get actionName(): string {
    return 'website-down';
  }
}
