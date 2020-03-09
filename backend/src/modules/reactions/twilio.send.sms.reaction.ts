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
import twilio from 'twilio';

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

class TwilioSendSMSReactionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  recipient: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  text: string;
}

@Entity('twilio_send_sms_reaction')
export class TwilioSendSMSReactionEntity implements ReactionEntity {
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
  text: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([TwilioSendSMSReactionEntity])],
})
export class TwilioSendSMSReaction extends Reaction<TwilioSendSMSReactionDTO, TwilioSendSMSReactionEntity> {
  constructor(
    @InjectRepository(TwilioSendSMSReactionEntity)
    private readonly repository: Repository<TwilioSendSMSReactionEntity>,
  ) {
    super();
  }

  async apply(config: TwilioSendSMSReactionEntity): Promise<ReactionResult> {
    const client = twilio(ACCOUNT_SID, AUTH_TOKEN);
    
    await client.messages.create({
      from: PHONE_NUMBER,
      to: config.recipient,
      body: config.text,
    });
  }

  get service(): string {
    return 'twilio';
  }

  get name(): string {
    return 'Send SMS';
  }

  get description(): string {
    return 'Send a SMS';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'recipient', name: 'Recipient',
          description: 'Target to send the SMS',
        },
        {
          kind: 'text', formId: 'text', name: 'Text',
          description: 'Text to send in the SMS',
        },
      ],
    };
  }

  dtoToEntity(dto: TwilioSendSMSReactionDTO): DeepPartial<TwilioSendSMSReactionEntity> {
    return {
      recipient: dto.recipient,
      text: dto.text,
    };
  }

  createTestEntity(testOwner: User): TwilioSendSMSReactionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      recipient: '+33652422484',
      text: 'Hello from AREA!',
    };
  }

  get entityRepository(): Repository<TwilioSendSMSReactionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<TwilioSendSMSReactionDTO> {
    return TwilioSendSMSReactionDTO;
  }

  get reactionName(): string {
    return 'twilio-send-sms';
  }
}
