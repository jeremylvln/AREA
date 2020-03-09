import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-slack';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { UserSlack } from './auth.slack.entity';
import { User } from '../../users/user.entity';
import { AuthService } from '../auth.service';
import { CacheService } from 'cache/cache.service';

const CLIENT_ID = process.env.SLACK_CLIENT_ID;
const CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;
const CALLBACK_URL = process.env.SLACK_CALLBACK_URL;

@Injectable()
export class SlackStrategy extends PassportStrategy(Strategy, 'slack') {
  constructor(
    private readonly authService: AuthService,
    private readonly cacheService: CacheService,

    @InjectRepository(UserSlack)
    private readonly usersSlackRepository: Repository<UserSlack>,
  ) {
    super({
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: ['channels:read', 'chat:write:bot'],
      passReqToCallback: true,
    });
  }


  async validate(req: Request, accessToken, refreshToken, profile): Promise<User | string> {
    if (req.query.forUser || req.session.connectService) {
      const id = req.query.forUser ? req.query.forUser : req.session.connectChallengerId;
      this.cacheService.storeUserToken(id, 'slack', accessToken);
      return req.user as User;
    }

    let foundUserBridge: Partial<UserSlack> = await this.usersSlackRepository.findOne({
      sid: profile.user.id,
    }, { relations: ['user'] });

    if (!profile.user.email) {
      throw new Error('No email available from Slack profile');
    }

    if (!foundUserBridge) {
      const nameBreakIdx = profile.user.name.indexOf(' ');

      const newUserDraft: Partial<User> = {
        email: profile.user.email,
        firstname: profile.user.name ? profile.user.name.substring(0, nameBreakIdx) : null,
        lastname: profile.user.name ? profile.user.name.substring(nameBreakIdx + 1) : null,
      };

      const newUser = await this.authService.createOrGetUser(newUserDraft);

      foundUserBridge = {
        sid: profile.user.id,
        user: newUser,
      };

      await this.usersSlackRepository.save(foundUserBridge);
    }

    this.cacheService.storeUserToken(foundUserBridge.user.id, 'slack', accessToken);

    return foundUserBridge.user;
  }
}
