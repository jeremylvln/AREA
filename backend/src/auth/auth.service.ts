import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthProvider, AuthProviderForm } from './auth.auth.provider';
import { AuthMethodEntry } from './ro/auth_methods.ro';
import { CacheService } from '../cache/cache.service';

const { FRONT_CALLBACK_URL } = process.env;

export const AUTH_METHODS: AuthMethodEntry[] = [
  { id: 'azuread', name: 'Azure', url: '/auth/azuread' },
  { id: 'github', name: 'GitHub', url: '/auth/github' },
  { id: 'facebook', name: 'Facebook', url: '/auth/facebook' },
  { id: 'google', name: 'Google', url: '/auth/google' },
  { id: 'twitter', name: 'Twitter', url: '/auth/twitter' },
  { id: 'slack', name: 'Slack', url: '/auth/slack' },
  { id: 'discord', name: 'Discord', url: '/auth/discord' },
];

export const AUTH_PROVIDERS: AuthProvider[] = [
  ...AUTH_METHODS.map((authMethod) => ({
    kind: 'external',
    id: authMethod.id,
    name: authMethod.name,
    url: `${authMethod.url}?connect-service`,
  })),
  {
    kind: 'form',
    id: 'epitech',
    name: 'Epitech',
    inputs: [{
      tokenName: 'autologin',
      formId: 'autologin',
      name: 'Autologin',
      description: 'Autologin link available on the intranet',
    }],
  },
];

export interface UserTokenPayload {
  sub: string;
  email: string;
  firstname: string;
  lastname: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly cacheService: CacheService,
  ) {}

  prepareLogIn(req: Request): void {
    if (!req.user) {
      return;
    }

    req.session.connectService = 'connect-service' in req.query;

    if (req.session.connectService) {
      req.session.connectChallengerId = (req.user as User).id;
    }
  }

  async logInSession(req: Request, res: Response, redirect: boolean = true): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      if (req.query.forUser || req.session.connectService) {
        delete (req.session as any).connectService;
        delete (req.session as any).connectChallengerId;
        res.redirect(301, FRONT_CALLBACK_URL);
        resolve();
        return;
      }

      if (process.env.NODE_ENV === 'test') {
        res.status(200).send(req.user as User);
        resolve();
        return;
      }

      req.logIn(req.user, (err) => {
        if (err) {
          reject(err);
          return;
        }

        const { password, ...finalUser } = req.user as User;

        if (redirect) {
          res.redirect(301, FRONT_CALLBACK_URL);
        } else {
          res.status(200).send(finalUser);
        }

        resolve();
      });
    });
  }

  async registerLocalUser(dto: RegisterDto): Promise<User> {
    if (await this.userService.hasUserWithEmail(dto.email)) {
      throw new Error('A user with this username already exists.');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });
    const newUser: Partial<User> = {
      email: dto.email,
      password: passwordHash,
      firstname: dto.firstname,
      lastname: dto.lastname,
    };

    return this.userService.saveUser(newUser);
  }

  async authenticateLocalUser(dto: LoginDto): Promise<User> {
    const databaseUser = await this.userService.getUserByEmail(dto.email);

    if (!databaseUser
    || !await argon2.verify(databaseUser.password, dto.password)) {
      throw new Error('Username or password incorrect.');
    }

    return databaseUser;
  }

  async createOrGetUser(user: Partial<User>): Promise<User> {
    const existing = await this.userService.getUserByEmail(user.email);

    if (existing) {
      return existing;
    }

    return this.userService.saveUser(user);
  }

  async getAuthProviderState(owner: string, authProvider: AuthProvider): Promise<boolean> {
    if (authProvider.kind === 'external') {
      return this.cacheService.hasStoredUserToken(owner, authProvider.id);
    }
    
    if (authProvider.kind === 'form') {
      const tokens = await Promise.all((authProvider as AuthProviderForm).inputs.map(async (input) => {
        return this.cacheService.hasStoredUserToken(owner, `${authProvider.id}-${input.tokenName}`);
      }));

      return !tokens.includes(false);
    }

    return false;
  }
}
