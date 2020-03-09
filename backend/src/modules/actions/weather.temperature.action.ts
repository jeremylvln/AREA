import {
  Entity, ManyToOne, PrimaryGeneratedColumn, DeepPartial, Column, Repository,
} from 'typeorm';
import { IsNotEmpty, IsString, IsInt, IsNumber, IsLatitude } from 'class-validator';
import { Expose } from 'class-transformer';
import { Type, Module, HttpService, HttpModule } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Action, ActionEntity, ActionResult } from '../modules.action';
import { User } from '../../users/user.entity';
import { Form } from '../modules.form';
import { COMPARISON_SYMBOLS, COMPARISON_FORM, validateComparison } from 'modules/utils/comparison.utils';
import { IsComparison } from 'common/decorators/is-in-enum.decorator';

export interface City {
  // Insee code of the city.
  insee: string;

  // Postal code of the city.
  cp: number;

  // Name of the city.
  name: string;

  // Latitude of the city.
  latitude: number;

  // Longitude of the city.
  longitude: number;

  // Altitude of the city.
  altitude: number;
}

export interface ForecastHour {
  // Insee code of the city.
  insee: string;

  // Latitude of the city.
  latitude: number;

  // Longitude of the city.
  longitude: number;

  // Day date.
  datetime: Date;

  // Temperature with 2 meters range in degrees celcius.
  temp2m: number;

  // Humidity with 2 meters range between 0 and 100.
  rh2m: number;

  // Mean of wind speed in km/h.
  wind10m: number;

  // Mean of gust speed in km/h.
  gust10m: number;

  // Wind direction in degrees (0 to 360).
  dirwind10m: number;

  // Sum of the rain fallen in mm.
  rr10: number;

  // Maximum sum of the rain fallen in mm.
  rr1: number;

  // Probability of raining between 0 and 100.
  probarain: number;

  // Weather code (see weather.utils.ts).
  weather: number;

  // Probability of frost between 0 and 100.
  probafrost: number;

  // Probability of fog between 0 and 100.
  probafog: number;

  // Probability of wind over 70 km/h between 0 and 100.
  probawind70: number;

  // Probability of wind over 100 km/h between 0 and 100.
  probawind100: number;

  // Soil temperature between 0 and 10 centimeters in degrees celcius.
  tsoil1: number;

  // Soil temperature between 10 and 40 centimeters in degrees celcius.
  tsoil2: number;

  // Potential gust under storm in km/h.
  gustx: number;

  // Altitude of isotherme 0 degree celcius in meters.
  iso0: number;
}

export interface Forecast {
  city: City,
  forecast: ForecastHour[];
}

const API_TOKEN = process.env.WEATHER_API_TOKEN || '';

class WeatherTemperatureActionDTO {
  @IsNumber()
  @IsLatitude()
  @Expose()
  latitude: number;

  @IsNumber()
  @IsLatitude()
  @Expose()
  longitude: number;

  @IsInt()
  @Expose()
  temperature: number;

  @IsNotEmpty()
  @IsString()
  @IsComparison()
  @Expose()
  comparison: string;
}

@Entity('weather_temperature_action')
export class WeatherTemperatureActionEntity implements ActionEntity {
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
    type: 'integer',
    nullable: false,
  })
  temperature: number;

  @Column({
    type: 'enum',
    enum: COMPARISON_SYMBOLS,
    nullable: false, 
  })
  comparison: string;
}

@Module({
  imports: [TypeOrmModule.forFeature([WeatherTemperatureActionEntity]), HttpModule],
})
export class WeatherTemperatureAction extends Action<WeatherTemperatureActionDTO, WeatherTemperatureActionEntity> {
  constructor(
    private readonly httpService: HttpService,

    @InjectRepository(WeatherTemperatureActionEntity)
    private readonly repository: Repository<WeatherTemperatureActionEntity>,
  ) {
    super();
  }

  async test(config: WeatherTemperatureActionEntity): Promise<ActionResult> {
    const res = await this.httpService.get<Forecast>(
      `https://api.meteo-concept.com/api/forecast/nextHours?token=${API_TOKEN}&latlng=${config.latitude},${config.longitude}`
    ).toPromise().then(({ data }) => {
      return data;
    });

    return validateComparison(res.forecast[0].temp2m, config.comparison, config.temperature);
  }

  get service(): string {
    return 'weather';
  }

  get name(): string {
    return 'Temperature';
  }

  get description(): string {
    return 'Trigger a task when the temperature of a location validate a condition';
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
          kind: 'number', formId: 'temperature', name: 'Temperature',
          description: 'Temperature of the location',
        },
        {
          kind: 'select', formId: 'comparison', name: 'Comparison',
          description: 'Mathematical comparison to execute on the temperature', choices: COMPARISON_FORM,
        },
      ],
    };
  }

  dtoToEntity(dto: WeatherTemperatureActionDTO): DeepPartial<WeatherTemperatureActionEntity> {
    return {
      latitude: dto.latitude,
      longitude: dto.longitude,
      temperature: dto.temperature,
      comparison: dto.comparison
    };
  }

  createTestEntity(testOwner: User): WeatherTemperatureActionEntity {
    return {
      instanceId: '1',
      owner: testOwner,
      latitude: 48.8087,
      longitude: 2.3560,
      temperature: 15,
      comparison: '>',
    };
  }

  get entityRepository(): Repository<WeatherTemperatureActionEntity> {
    return this.repository;
  }

  get dtoClass(): Type<WeatherTemperatureActionDTO> {
    return WeatherTemperatureActionDTO;
  }

  get actionName(): string {
    return 'weather-temperature';
  }
}
