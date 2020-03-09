import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { Type, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { ReactionEntity, Reaction, ReactionResult } from '../modules.reaction';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import { WebClient } from '@slack/web-api';
import { CacheService } from 'cache/cache.service';
import { CacheModule } from 'cache/cache.module';

class SlackSendMessageReactionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  channelId: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  text: string;
}

@Entity('slack_send_message_reaction')
export class SlackSendMessageReactionEntity implements ReactionEntity {
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
  channelId: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  text: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([SlackSendMessageReactionEntity]), CacheModule],
})
export class SlackSendMessageReaction extends Reaction<SlackSendMessageReactionDTO, SlackSendMessageReactionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(SlackSendMessageReactionEntity)
    private readonly repository: Repository<SlackSendMessageReactionEntity>,
  ) {
    super();
  }

  async apply(config: SlackSendMessageReactionEntity): Promise<ReactionResult> {
    if (!(await this.cacheService.hasStoredUserToken(config.owner.id, 'slack'))) {
      return 'missing_credentials';
    }

    const token = await this.cacheService.getStoredUserToken(config.owner.id, 'slack');
    const client = new WebClient(token);

    await client.chat.postMessage({
      text: config.text,
      channel: config.channelId,
    });
  }

  get service(): string {
    return 'slack';
  }

  get name(): string {
    return 'Send Message';
  }

  get description(): string {
    return 'Send a message to a channel';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'text', name: 'Text',
          description: 'Text to send in the SMS',
        },
        {
          kind: 'text', formId: 'text', name: 'Text',
          description: 'Text to send in the SMS',
        },
      ],
    };
  }

  dtoToEntity(dto: SlackSendMessageReactionDTO): DeepPartial<SlackSendMessageReactionEntity> {
    return {
      channelId: dto.channelId,
      text: dto.text,
    };
  }

  createTestEntity(testOwner: User): SlackSendMessageReactionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      channelId: 'CR5R9QYQM',
      text: 'Hello from AREA!',
    };
  }

  get entityRepository(): Repository<SlackSendMessageReactionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<SlackSendMessageReactionDTO> {
    return SlackSendMessageReactionDTO;
  }

  get reactionName(): string {
    return 'slack-send-message';
  }

  get authTokenProvider(): string | null {
    return 'slack';
  }
}
