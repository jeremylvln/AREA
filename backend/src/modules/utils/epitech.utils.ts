import { CacheService } from "cache/cache.service";
import { HttpService } from '@nestjs/common';
import { parse as parseCookies } from 'cookie';

export interface EpitechProfile {
  login: string;
  title: string;
  internal_email: string;
  lastname: string;
  firstname: string;
  picture: string;
  scolaryear: string;
  promo: number;
  semester: number;
  location: string;
  course_code: string;
  semester_code: string;
  groups: {
    title: string;
    name: string;
    count: number;
  }[];
  credits: number;
  gpa: {
    gpa: string;
    cycle: 'bachelor' | 'master';
  }[];
  spice: {
    available_spice: string;
    consumed_spice: number;
  };
}

export interface EpitechModule {
  scolaryear: number;
  id_user_history: string;
  codemodule: string;
  codeinstance: string;
  title: string;
  date_ins: string;
  cycle: string;
  grade: string;
  credits: number;
  barrage: number;
}

export interface EpitechGrade {
  scolaryear: number;
  codemodule: string;
  titlemodule: string;
  codeinstance: string;
  codeacti: string;
  title: string;
  date: string;
  correcteur: string;
  final_note: number;
  comment: string;
}

export class EpitechClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly token: string
  ) {}

  async getProfile(login: string = null): Promise<EpitechProfile> {
    return this.httpService.get<EpitechProfile>(
      `https://intra.epitech.eu/user/${login ? `${login}/` : ''}?format=json`,
      {
        headers: {
          Cookie: `user=${this.token}`,
        },
      },
    ).toPromise().then(({ data }) => data);
  }

  async getGrades(login: string = null): Promise<EpitechGrade[]> {
    if (!login) {
      login = (await this.getProfile()).login;
    }

    return this.httpService.get(
      `https://intra.epitech.eu/user/${login}/notes?format=json`,
      {
        headers: {
          Cookie: `user=${this.token}`,
        },
      },
    ).toPromise()
    .then(({ data }) => data.notes as EpitechGrade[])
    .then(grades => grades.sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf()));
  }

  async getSubscribedModules(login: string = null): Promise<EpitechModule[]> {
    if (!login) {
      login = (await this.getProfile()).login;
    }

    return this.httpService.get(
      `https://intra.epitech.eu/user/${login}/notes?format=json`,
      {
        headers: {
          Cookie: `user=${this.token}`,
        },
      },
    ).toPromise()
    .then(({ data }) => data.modules as EpitechModule[])
    .then(grades => grades.sort((a, b) => new Date(b.date_ins).valueOf() - new Date(a.date_ins).valueOf()));
  }
}

export async function createEpitechClient(
  cacheService: CacheService, owner: string, httpService: HttpService
): Promise<EpitechClient> {
  if (!(await cacheService.hasStoredUserToken(owner, 'epitech-autologin'))) {
    throw new Error('No epitech autologin found for connected user');
  }

  const autologin = await cacheService.getStoredUserToken(owner, 'epitech-autologin');

  const token = await httpService.get(autologin, {
    maxRedirects: 0,
    validateStatus: (code) => code === 302,
  }).toPromise().then(({ headers }) => {
    const cookies = {};

    headers['set-cookie'].forEach((cookie: string) => {
      Object.assign(cookies, parseCookies(cookie));
    });

    return cookies['user'];
  });

  return new EpitechClient(httpService, token);
}