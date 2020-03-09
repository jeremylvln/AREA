import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './auth.local.strategy';
import { UserAzureAd } from './azure/auth.azuread.entity';
import { UserGitHub } from './github/auth.github.entity';
import { AzureAdStrategy } from './azure/auth.azuread.strategy';
import { GitHubStrategy } from './github/auth.github.strategy';
import { SessionSerializer } from './session.serializer';
import { FacebookStrategy } from './facebook/auth.facebook.strategy';
import { UserFacebook } from './facebook/auth.facebook.entity';
import { GoogleStrategy } from './google/auth.google.strategy';
import { UserGoogle } from './google/auth.google.entity';
import { CacheModule } from 'cache/cache.module';
import { UserTwitter } from './twitter/auth.twitter.entity';
import { TwitterStrategy } from './twitter/auth.twitter.strategy';
import { UserSlack } from './slack/auth.slack.entity';
import { SlackStrategy } from './slack/auth.slack.strategy';
import { DiscordStrategy } from './discord/auth.discord.strategy';
import { UserDiscord } from './discord/auth.discord.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserAzureAd, UserGitHub, UserFacebook, UserGoogle, UserTwitter,
      UserSlack, UserDiscord,
    ]),
    UsersModule,
    CacheModule,
    PassportModule.register({
      session: true,
    }),
  ],
  providers: [
    AuthService, SessionSerializer, LocalStrategy, AzureAdStrategy, GitHubStrategy,
    FacebookStrategy, GoogleStrategy, TwitterStrategy, SlackStrategy, DiscordStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
