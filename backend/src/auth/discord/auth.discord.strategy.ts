import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { UserDiscord } from './auth.discord.entity';
import { User } from '../../users/user.entity';
import { AuthService } from '../auth.service';
import { CacheService } from 'cache/cache.service';

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const CALLBACK_URL = process.env.DISCORD_CALLBACK_URL;

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(
    private readonly authService: AuthService,
    private readonly cacheService: CacheService,

    @InjectRepository(UserDiscord)
    private readonly usersDiscordRepository: Repository<UserDiscord>,
  ) {
    super({
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: ['identify', 'email', 'messages.read'],
      passReqToCallback: true,
    });
  }


  async validate(req: Request, accessToken, refreshToken, profile): Promise<User | string> {
    if (req.query.forUser || req.session.connectService) {
      const id = req.query.forUser ? req.query.forUser : req.session.connectChallengerId;
      this.cacheService.storeUserToken(id, 'discord', accessToken);
      return req.user as User;
    }

    let foundUserBridge: Partial<UserDiscord> = await this.usersDiscordRepository.findOne({
      did: profile.id,
    }, { relations: ['user'] });

    if (!profile.email) {
      throw new Error('No email available from Discord profile');
    }

    if (!foundUserBridge) {
      const newUserDraft: Partial<User> = {
        email: profile.email,
      };

      const newUser = await this.authService.createOrGetUser(newUserDraft);

      foundUserBridge = {
        did: profile.id,
        user: newUser,
      };

      await this.usersDiscordRepository.save(foundUserBridge);
    }

    this.cacheService.storeUserToken(foundUserBridge.user.id, 'discord', accessToken);

    return foundUserBridge.user;
  }
}
