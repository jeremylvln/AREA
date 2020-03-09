import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { AuthMethodEntry } from '../ro/auth_methods.ro';
import { UserGoogle } from './auth.google.entity';
import { User } from '../../users/user.entity';
import { AuthService } from '../auth.service';
import { CacheService } from 'cache/cache.service';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    private readonly cacheService: CacheService,

    @InjectRepository(UserGoogle)
    private readonly usersGoogleRepository: Repository<UserGoogle>,
  ) {
    super({
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      passReqToCallback: true,
      scope: ['profile', 'email'],
    });
  }


  async validate(req: Request, accessToken, unknown, profile): Promise<User | null> {
    if (req.query.forUser || req.session.connectService) {
      const id = req.query.forUser ? req.query.forUser : req.session.connectChallengerId;
      this.cacheService.storeUserToken(id, 'google', accessToken);
      return req.user as User;
    }

    let foundUserBridge: Partial<UserGoogle> = await this.usersGoogleRepository.findOne({
      gid: profile.id,
    }, { relations: ['user'] });

    if (!profile.emails || !profile.emails[0]) {
      throw new Error('No email available from Google profile');
    }

    if (!foundUserBridge) {
      const newUserDraft: Partial<User> = {
        email: profile.emails[0].value,
        firstname: profile.name.givenName,
        lastname: profile.name.familyName,
      };

      const newUser = await this.authService.createOrGetUser(newUserDraft);

      foundUserBridge = {
        gid: profile.id,
        user: newUser,
      };

      await this.usersGoogleRepository.save(foundUserBridge);
    }

    this.cacheService.storeUserToken(foundUserBridge.user.id, 'google', accessToken);

    return foundUserBridge.user;
  }
}
