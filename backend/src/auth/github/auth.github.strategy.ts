import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { AuthMethodEntry } from '../ro/auth_methods.ro';
import { UserGitHub } from './auth.github.entity';
import { User } from '../../users/user.entity';
import { AuthService } from '../auth.service';
import { CacheService } from 'cache/cache.service';

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly authService: AuthService,
    private readonly cacheService: CacheService,

    @InjectRepository(UserGitHub)
    private readonly usersGitHubRepository: Repository<UserGitHub>,
  ) {
    super({
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      passReqToCallback: true,
    });
  }


  async validate(req: Request, accessToken, _, payload): Promise<User | null> {
    if (req.query.forUser || req.session.connectService) {
      const id = req.query.forUser ? req.query.forUser : req.session.connectChallengerId;
      this.cacheService.storeUserToken(id, 'github', accessToken);
      return req.user as User;
    }

    let foundUserBridge: Partial<UserGitHub> = await this.usersGitHubRepository.findOne({
      gid: payload.id,
    }, { relations: ['user'] });

    if (!payload.emails || !payload.emails[0]) {
      throw new Error('No email available from GitHub profile');
    }

    if (!foundUserBridge) {
      const nameBreakIdx = payload.displayName.indexOf(' ');

      const newUserDraft: Partial<User> = {
        email: payload.emails[0].value,
        firstname: payload.displayName ? payload.displayName.substring(0, nameBreakIdx) : null,
        lastname: payload.displayName ? payload.displayName.substring(nameBreakIdx + 1) : null,
      };

      const newUser = await this.authService.createOrGetUser(newUserDraft);

      foundUserBridge = {
        gid: payload.id,
        user: newUser,
      };

      await this.usersGitHubRepository.save(foundUserBridge);
    }

    this.cacheService.storeUserToken(foundUserBridge.user.id, 'github', accessToken);

    return foundUserBridge.user;
  }
}
