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
import * as Redtube from 'redtube';
import { CacheModule } from 'cache/cache.module';
import { CacheService } from 'cache/cache.service';

class RedtubeNewVideoActionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  query: string;
}

@Entity('redtube_new_video_action')
export class RedtubeNewVideoActionEntity implements ActionEntity {
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
  query: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([RedtubeNewVideoActionEntity]), CacheModule],
})
export class RedtubeNewVideoAction extends Action<RedtubeNewVideoActionDTO, RedtubeNewVideoActionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(RedtubeNewVideoActionEntity)
    private readonly repository: Repository<RedtubeNewVideoActionEntity>,
  ) {
    super();
  }

  async test(config: RedtubeNewVideoActionEntity): Promise<ActionResult> {
    return new Promise<boolean>(async (resolve, reject) => {
      const redtube = new Redtube({
        output: 'json',
      });
  
      redtube.search({
        search: config.query,
        ordering: 'newest',
      }, async (err, res) => {
        if (err) {
          reject(err);
          return;
        }

        const lastVideo = res.videos[0];
        const queryPlused = encodeURIComponent(config.query);

        if (!await this.cacheService.hasStoredState(null, 'redtube', `${queryPlused}-last-video`)) {
          await this.cacheService.storeState(null, 'redtube', `${queryPlused}-last-video`, lastVideo.video_id);
          resolve(false);
          return;
        }
    
        const saved = await this.cacheService.getStoredState(null, 'redtube', `${queryPlused}-last-video`);
        await this.cacheService.storeState(null, 'redtube', `${queryPlused}-last-video`, lastVideo.video_id);
        resolve(lastVideo.video_id !== saved);
      });
    });
  }

  get service(): string {
    return 'redtube';
  }

  get name(): string {
    return 'New Video';
  }

  get description(): string {
    return 'Trigger a task when a new video is uploaded';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'query', name: 'Query',
          description: 'Search query to monitor',
        },
      ],
    };
  }

  dtoToEntity(dto: RedtubeNewVideoActionDTO): DeepPartial<RedtubeNewVideoActionEntity> {
    return {
      query: dto.query,
    };
  }

  createTestEntity(testOwner: User): RedtubeNewVideoActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      query: 'lesbian',
    };
  }

  get entityRepository(): Repository<RedtubeNewVideoActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<RedtubeNewVideoActionDTO> {
    return RedtubeNewVideoActionDTO;
  }

  get actionName(): string {
    return 'redtube-new-video';
  }
}
