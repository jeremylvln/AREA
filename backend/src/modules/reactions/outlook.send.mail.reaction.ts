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
import { CacheModule } from 'cache/cache.module';
import { CacheService } from 'cache/cache.service';
import * as graph from '@microsoft/microsoft-graph-client';

class OutlookSendMailReactionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  recipient: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  subject: string; 

  @IsNotEmpty()
  @IsString()
  @Expose()
  text: string;
}

@Entity('outlook_send_mail_reaction')
export class OutlookSendMailReactionEntity implements ReactionEntity {
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
  recipient: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  subject: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  text: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([OutlookSendMailReactionEntity]), CacheModule],
})
export class OutlookSendMailReaction extends Reaction<OutlookSendMailReactionDTO, OutlookSendMailReactionEntity> {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(OutlookSendMailReactionEntity)
    private readonly repository: Repository<OutlookSendMailReactionEntity>,
  ) {
    super();
  }

  async apply(config: OutlookSendMailReactionEntity): Promise<ReactionResult> {
    if (!(await this.cacheService.hasStoredUserToken(config.owner.id, 'azuread'))) {
      return 'missing_credentials';
    }

    const accessToken = await this.cacheService.getStoredUserToken(config.owner.id, 'azuread');

    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    await client
      .api('/me/sendMail')
      .post({
        message: {
          subject: config.subject,
          body: {
            contentType: 'Text',
            content: config.text,
          },
          toRecipients: [{
            emailAddress: {
              address: config.recipient,
            },
          }],
        },
        saveToSentItems: 'false',
      });
  }

  get service(): string {
    return 'outlook';
  }

  get name(): string {
    return 'Send Mail';
  }

  get description(): string {
    return 'Send a mail';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'recipient', name: 'Recipient',
          description: 'Email address to whom to send to mail',
        },
        {
          kind: 'text', formId: 'subject', name: 'Subject',
          description: 'Subject of the mail',
        },
        {
          kind: 'text', formId: 'text', name: 'Text',
          description: 'Text to send in the mail',
        },
      ],
    };
  }

  dtoToEntity(dto: OutlookSendMailReactionDTO): DeepPartial<OutlookSendMailReactionEntity> {
    return {
      recipient: dto.recipient,
      subject: dto.subject,
      text: dto.text,
    };
  }

  createTestEntity(testOwner: User): OutlookSendMailReactionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      recipient: 'jeremy.levilain@epitech.eu',
      subject: 'AREA',
      text: 'Hello from AREA!',
    };
  }

  get entityRepository(): Repository<OutlookSendMailReactionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<OutlookSendMailReactionDTO> {
    return OutlookSendMailReactionDTO;
  }

  get reactionName(): string {
    return 'outlook-send-mail';
  }

  get authTokenProvider(): string | null {
    return 'azuread';
  }
}
