import { Injectable } from '@nestjs/common';
import { OIDCStrategy, VerifyCallback, IProfile } from 'passport-azure-ad';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { UserAzureAd } from './auth.azuread.entity';
import { User } from '../../users/user.entity';
import { AuthService } from '../auth.service';
import passport from 'passport';
import { CacheService } from 'cache/cache.service';

const TENANT = process.env.AZURE_TENANT;
const CLIENT_ID = process.env.AZURE_CLIENT_ID;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
const REDIRECT_URL = process.env.AZURE_REDIRECT_URL;

abstract class FixedOIDCStrategy extends OIDCStrategy {
  abstract validate(
    req: Request, iss: string, sub: string, profile: IProfile, access_token: string,
    refresh_token: string,
  ): any;

  constructor(options) {
    const callback = async (
      req: Request, iss: string, sub: string, profile: IProfile, access_token: string,
      refresh_token: string, done: VerifyCallback,
    ) => {
      try {
        const validateResult = await this.validate(req, iss, sub, profile, access_token, refresh_token);

        if (Array.isArray(validateResult)) {
          done(null, ...validateResult);
        } else {
          done(null, validateResult);
        }
      } catch (err) {
        done(err, null);
      }
    };

    super(options, (req, iss, sub, profile, access_token, refresh_token, done) =>
      callback(req, iss, sub, profile, access_token, refresh_token, done)
    );

    passport.use('azuread', this as any);
  }
}

@Injectable()
export class AzureAdStrategy extends FixedOIDCStrategy {
  constructor(
    private readonly authService: AuthService,
    private readonly cacheService: CacheService,

    @InjectRepository(UserAzureAd)
    private readonly usersAzureRepository: Repository<UserAzureAd>,
  ) {
    super({
      identityMetadata: `https://login.microsoftonline.com/${TENANT}/v2.0/.well-known/openid-configuration`,
      clientID: CLIENT_ID,
      responseType: 'code',
      responseMode: 'query',
      redirectUrl: REDIRECT_URL,
      allowHttpForRedirectUrl: REDIRECT_URL.startsWith('http://'),
      clientSecret: CLIENT_SECRET,
      useCookieInsteadOfSession: false,
      scope: ['email', 'profile', 'Mail.ReadWrite', 'Mail.Send', 'Tasks.Read', 'Tasks.ReadWrite'],
      passReqToCallback: true,
    });
  }

  async validate(req: Request, iss: string, sub: string, profile: IProfile, accessToken: string): Promise<User> {
    if (req.query.forUser || req.session.connectService) {
      const id = req.query.forUser ? req.query.forUser : req.session.connectChallengerId;
      this.cacheService.storeUserToken(id, 'azuread', accessToken);
      return req.user as User;
    }

    let foundUserBridge: Partial<UserAzureAd> = await this.usersAzureRepository.findOne({
      oid: profile.oid,
    }, { relations: ['user'] });

    if (!foundUserBridge) {
      const nameBreakIdx = profile.displayName.indexOf(' ');

      const newUserDraft: Partial<User> = {
        // eslint-disable-next-line no-underscore-dangle
        email: profile._json.email,
        firstname: profile.displayName.substring(0, nameBreakIdx),
        lastname: profile.displayName.substring(nameBreakIdx + 1),
      };

      const newUser = await this.authService.createOrGetUser(newUserDraft);

      foundUserBridge = {
        oid: profile.oid,
        user: newUser,
      };

      await this.usersAzureRepository.save(foundUserBridge);
    }

    this.cacheService.storeUserToken(req.session.connectChallengerId, 'azuread', accessToken);

    return foundUserBridge.user;
  }
}
