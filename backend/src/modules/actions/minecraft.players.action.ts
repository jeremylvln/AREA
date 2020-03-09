import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsNotEmpty, IsString, IsInt, Min, Validate } from 'class-validator';
import { Expose } from 'class-transformer';
import { Type, Module, HttpService, HttpModule } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import { COMPARISON_SYMBOLS, COMPARISON_FORM, validateComparison } from 'modules/utils/comparison.utils';
import { IsComparison } from '../../common/decorators/is-in-enum.decorator';

interface MinecraftServer {
  ip: string;
  players: {
    online: number;
    max: number;
    list?: string[];
  };
  version: string;
  online: boolean;
  hostname: string;
}

class MinecraftPlayersActionDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  ip: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Expose()
  players: number;

  @IsNotEmpty()
  @IsString()
  @IsComparison()
  @Expose()
  comparison: string;
}

@Entity('minecraft_players_action')
export class MinecraftPlayersActionEntity implements ActionEntity {
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
  ip: string;

  @Column({
    type: 'int',
    nullable: false,
  })
  players: number;

  @Column({
    type: 'enum',
    enum: COMPARISON_SYMBOLS,
    nullable: false,
  })
  comparison: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([MinecraftPlayersActionEntity]), HttpModule],
})
export class MinecraftPlayersAction extends Action<MinecraftPlayersActionDTO, MinecraftPlayersActionEntity> {
  constructor(
    private readonly httpService: HttpService,

    @InjectRepository(MinecraftPlayersActionEntity)
    private readonly repository: Repository<MinecraftPlayersActionEntity>,
  ) {
    super();
  }

  async test(config: MinecraftPlayersActionEntity): Promise<ActionResult> {
    const server = (await this.httpService.get<MinecraftServer>(
      `https://api.mcsrvstat.us/2/${config.ip}`,
    ).toPromise()).data;

    return validateComparison(server.players.online, config.comparison, config.players);
  }

  get service(): string {
    return 'minecraft';
  }

  get name(): string {
    return 'Players';
  }

  get description(): string {
    return 'Trigger when there is a certain amount a player';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'text', formId: 'ip', name: 'IP address',
          description: 'IP address of the Minecraft Server',
        },
        {
          kind: 'number', formId: 'players', name: 'Number of players',
          description: 'Number of players to use during the comparison', minValue: 0,
        },
        {
          kind: 'select', formId: 'comparison', name: 'Comparison',
          description: 'Mathematical comparison to execute on the player number', choices: COMPARISON_FORM,
        },
      ],
    };
  }

  dtoToEntity(dto: MinecraftPlayersActionDTO): DeepPartial<MinecraftPlayersActionEntity> {
    return {
      ip: dto.ip,
      players: dto.players,
      comparison: dto.comparison,
    };
  }

  createTestEntity(testOwner: User): MinecraftPlayersActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      ip: 'mc.hypixel.net',
      players: 20000,
      comparison: '>=',
    };
  }

  get entityRepository(): Repository<MinecraftPlayersActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<MinecraftPlayersActionDTO> {
    return MinecraftPlayersActionDTO;
  }

  get actionName(): string {
    return 'minecraft-players';
  }
}
