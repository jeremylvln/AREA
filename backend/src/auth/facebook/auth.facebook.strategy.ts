import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from '@passport-next/passport-facebook';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { AuthMethodEntry } from '../ro/auth_methods.ro';
import { UserFacebook } from './auth.facebook.entity';
import { User } from '../../users/user.entity';
import { AuthService } from '../auth.service';
import { CacheService } from 'cache/cache.service';

const CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
const CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
const CALLBACK_URL = process.env.FACEBOOK_CALLBACK_URL;

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly authService: AuthService,
    private readonly cacheService: CacheService,

    @InjectRepository(UserFacebook)
    private readonly usersFacebookRepository: Repository<UserFacebook>,
  ) {
    super({
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      graphApiVersion: 'v3.2',
      scope: ['email'],
      profileFields: ['id', 'displayName', 'email'],
      passReqToCallback: true,
    });
  }


  async validate(req: Request, accessToken, refreshToken, profile): Promise<User | null> {
    if (req.query.forUser || req.session.connectService) {
      const id = req.query.forUser ? req.query.forUser : req.session.connectChallengerId;
      this.cacheService.storeUserToken(id, 'facebook', accessToken);
      return req.user as User;
    }

    let foundUserBridge: Partial<UserFacebook> = await this.usersFacebookRepository.findOne({
      fid: profile.id,
    }, { relations: ['user'] });

    if (!profile.emails || !profile.emails[0]) {
      throw new Error('No email available from Facebook profile');
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
        fid: profile.id,
        user: newUser,
      };

      await this.usersFacebookRepository.save(foundUserBridge);
    }

    this.cacheService.storeUserToken(req.session.connectChallengerId, 'facebook', accessToken);

    return foundUserBridge.user;
  }
}
