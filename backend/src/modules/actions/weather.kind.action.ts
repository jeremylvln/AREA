import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsNotEmpty, IsString, IsNumber, IsLatitude } from 'class-validator';
import { Expose } from 'class-transformer';
import { Type, Module, HttpService, HttpModule } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import { IsInEnum } from 'common/decorators/is-in-enum.decorator';
import { Forecast } from './weather.temperature.action';

const API_TOKEN = process.env.WEATHER_API_TOKEN || '';

const WEATHER_KINDS = [
  'sunny', 'cloudy', 'foggy', 'rainy', 'snowy', 'stormy', 'hailstorm',
];

const WEATHER_FORM = WEATHER_KINDS.map((kind) => ({
  name: kind[0].toUpperCase() + kind.substr(1),
  value: kind,
}));

class WeatherKindActionDTO {
  @IsNumber()
  @IsLatitude()
  @Expose()
  latitude: number;

  @IsNumber()
  @IsLatitude()
  @Expose()
  longitude: number;

  @IsNotEmpty()
  @IsString()
  @IsInEnum(WEATHER_KINDS)
  kind: string;
}

@Entity('weather_kind_action')
export class WeatherKindActionEntity implements ActionEntity {
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
    type: 'float',
    nullable: false,
  })
  latitude: number;

  @Column({
    type: 'float',
    nullable: false,
  })
  longitude: number;

  @Column({
    type: 'enum',
    enum: WEATHER_KINDS,
    nullable: false,
  })
  kind: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([WeatherKindActionEntity]), HttpModule],
})
export class WeatherKindAction extends Action<WeatherKindActionDTO, WeatherKindActionEntity> {
  constructor(
    private readonly httpService: HttpService,

    @InjectRepository(WeatherKindActionEntity)
    private readonly repository: Repository<WeatherKindActionEntity>,
  ) {
    super();
  }

  async test(config: WeatherKindActionEntity): Promise<ActionResult> {
    const res = await this.httpService.get<Forecast>(
      `https://api.meteo-concept.com/api/forecast/nextHours?token=${API_TOKEN}&latlng=${config.latitude},${config.longitude}`
    ).toPromise().then(({ data }) => {
      return data;
    });

    return WeatherKindAction.getWeatherFromCode(res.forecast[0].weather) === config.kind;
  }

  get service(): string {
    return 'weather';
  }

  get name(): string {
    return 'Kind';
  }

  get description(): string {
    return 'Trigger a task when the kind of the weather of a location is the same';
  }

  get form(): Form {
    return {
      inputs: [
        {
          kind: 'number', formId: 'latitude', name: 'Latitude',
          description: 'Latitude of the location to check',
        },
        {
          kind: 'number', formId: 'longitude', name: 'Longitude',
          description: 'Longitude of the location to check',
        },
        {
          kind: 'select', formId: 'kind', name: 'Kind',
          description: 'Kind of the weather', choices: WEATHER_FORM,
        },
      ],
    };
  }

  dtoToEntity(dto: WeatherKindActionDTO): DeepPartial<WeatherKindActionEntity> {
    return {
      latitude: dto.latitude,
      longitude: dto.longitude,
      kind: dto.kind,
    };
  }

  createTestEntity(testOwner: User): WeatherKindActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      latitude: 48.8087,
      longitude: 2.3560,
      kind: 'sunny',
    };
  }

  get entityRepository(): Repository<WeatherKindActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<WeatherKindActionDTO> {
    return WeatherKindActionDTO;
  }

  get actionName(): string {
    return 'weather-kind';
  }

  private static getWeatherFromCode(code: number): string {
    if (code == 0 || code == 1) {
      return 'sunny';
    } else if (code >= 2 && code <= 5) {
      return 'cloudy';
    } else if (code == 6 || code == 7) {
      return 'foggy';
    } else if (code >= 10 && code <= 16) {
      return 'rainy';
    } else if (code >= 20 && code <= 22) {
      return 'snowy';
    } else if (code >= 30 && code <= 32) {
      return 'rainy_and_snowy';
    } else if (code >= 40 && code <= 48) {
      return 'rainy';
    } else if (code >= 60 && code <= 68) {
      return 'snowy';
    } else if (code >= 70 && code <= 78) {
      return 'rainy_and_snowy';
    } else if (code >= 100 && code <= 142) {
      return 'stormy';
    } else if (code >= 210 && code <= 212) {
      return 'rainy';
    } else if (code >= 220 && code <= 222) {
      return 'snowy';
    } else if (code >= 230 && code <= 232) {
      return 'rainy_and_snowy';
    } else if (code == 235) {
      return 'hailstorm';
    } else {
      return 'unknown';
    }
  }
}
