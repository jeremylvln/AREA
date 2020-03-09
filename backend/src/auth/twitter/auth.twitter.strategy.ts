import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { AuthMethodEntry } from '../ro/auth_methods.ro';
import { UserTwitter } from './auth.twitter.entity';
import { User } from '../../users/user.entity';
import { AuthService } from '../auth.service';
import { CacheService } from 'cache/cache.service';

const CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
const CALLBACK_URL = process.env.TWITTER_CALLBACK_URL;

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
  constructor(
    private readonly authService: AuthService,
    private readonly cacheService: CacheService,

    @InjectRepository(UserTwitter)
    private readonly usersTwitterRepository: Repository<UserTwitter>,
  ) {
    super({
      consumerKey: CONSUMER_KEY,
      consumerSecret: CONSUMER_SECRET,
      callbackURL: CALLBACK_URL,
      passReqToCallback: true,
    });
  }


  async validate(req: Request, accessToken, accessTokenSecret, profile): Promise<User | string> {
    if (req.query.forUser || req.session.connectService) {
      const id = req.query.forUser ? req.query.forUser : req.session.connectChallengerId;
      this.cacheService.storeUserToken(id, 'twitter', accessToken);
      this.cacheService.storeUserToken(id, 'twitter-secret', accessTokenSecret);
      return req.user as User;
    }

    let foundUserBridge: Partial<UserTwitter> = await this.usersTwitterRepository.findOne({
      tid: profile.id,
    }, { relations: ['user'] });

    if (!profile.emails || !profile.emails[0]) {
      throw new Error('No email available from Twitter profile');
    }

    if (!foundUserBridge) {
      const nameBreakIdx = profile.displayName.indexOf(' ');

      const newUserDraft: Partial<User> = {
        email: profile.emails[0].value,
        firstname: profile.displayName ? profile.displayName.substring(0, nameBreakIdx) : null,
        lastname: profile.displayName ? profile.displayName.substring(nameBreakIdx + 1) : null,
      };

      const newUser = await this.authService.createOrGetUser(newUserDraft);

      foundUserBridge = {
        tid: profile.id,
        user: newUser,
      };

      await this.usersTwitterRepository.save(foundUserBridge);
    }

    this.cacheService.storeUserToken(foundUserBridge.user.id, 'twitter', accessToken);
    this.cacheService.storeUserToken(foundUserBridge.user.id, 'twitter-secret', accessTokenSecret);

    return foundUserBridge.user;
  }
}
