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
import { CacheService } from 'cache/cache.service';
import { CacheModule } from 'cache/cache.module';
import { google } from 'googleapis';

const API_KEY = process.env.YOUTUBE_API_KEY;

class YouTubeNewVideoActionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  channel: string;
}

@Entity('youtube_new_video_action')
export class YouTubeNewVideoActionEntity implements ActionEntity {
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
  channel: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([YouTubeNewVideoActionEntity]), CacheModule],
})
export class YouTubeNewVideoAction extends Action<YouTubeNewVideoActionDTO, YouTubeNewVideoActionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(YouTubeNewVideoActionEntity)
    private readonly repository: Repository<YouTubeNewVideoActionEntity>,
  ) {
    super();
  }

  async test(config: YouTubeNewVideoActionEntity): Promise<ActionResult> {
    const youtube = google.youtube({
      version: 'v3',
      auth: API_KEY,
    });
    const channel = await youtube.channels.list({
      forUsername: config.channel,
    });
    const playlist = await youtube.playlistItems.list({
      part: 'contentDetails',
      playlistId: channel.data.items[0].contentDetails.relatedPlaylists.uploads,
      maxResults: 1,
    });
    const lastVideo = playlist.data.items[0];

    if (!await this.cacheService.hasStoredState(null, 'youtube', `${config.channel}-last-video`)) {
      await this.cacheService.storeState(null, 'youtube', `${config.channel}-last-video`, lastVideo.id);
      return false;
    }

    const saved = await this.cacheService.getStoredState(null, 'youtube', `${config.channel}-last-video`);
    await this.cacheService.storeState(null, 'youtube', `${config.channel}-last-video`, lastVideo.id);
    return lastVideo.id !== saved;
  }

  get service(): string {
    return 'youtube';
  }

  get name(): string {
    return 'New Video';
  }

  get description(): string {
    return 'Trigger a task when a new video is uploaded on a specific channel';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'channel', name: 'Channel',
          description: 'Channel to monitor',
        },
      ],
    };
  }

  dtoToEntity(dto: YouTubeNewVideoActionDTO): DeepPartial<YouTubeNewVideoActionEntity> {
    return {
      channel: dto.channel,
    };
  }

  createTestEntity(testOwner: User): YouTubeNewVideoActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      channel: 'Monstercat',
    };
  }

  get entityRepository(): Repository<YouTubeNewVideoActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<YouTubeNewVideoActionDTO> {
    return YouTubeNewVideoActionDTO;
  }

  get actionName(): string {
    return 'youtube-new-channel';
  }
}
