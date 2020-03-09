import {
  Body, Controller, Post, UseGuards, Get, Req, Res, HttpCode, HttpStatus, Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import passport = require('passport');
import { RegisterDto } from './dto/register.dto';
import { AuthMethodsResponse } from './ro/auth_methods.ro';
import { AuthService, AUTH_METHODS, AUTH_PROVIDERS } from './auth.service';
import { User } from '../users/user.entity';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { LinkStateResponse } from './ro/link_states.ro';
import { CacheService } from '../cache/cache.service';
import { BasicResponseObject } from '../common/ro/basic.ro';
import { AuthProviderForm } from './auth.auth.provider';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  methods(): AuthMethodsResponse {
    return {
      methods: AUTH_METHODS,
    };
  }

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  me(@CurrentUser() user): User {
    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Req() req: Request): void {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    req.logOut();
  }

  @Post('register')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() body: RegisterDto): Promise<void> {
    await this.authService.registerLocalUser(body);
  }

  /* istanbul ignore next */
  @Post('login')
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.authService.logInSession(req, res, false);
  }

  /* istanbul ignore next */
  @Get('linkstate')
  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.OK)
  async getLinkStates(@CurrentUser() user: User): Promise<LinkStateResponse> {
    return {
      services: await Promise.all(AUTH_PROVIDERS.map(async (authProvider) => ({
        ...authProvider,
        url: 'url' in authProvider ? authProvider.url : `/auth/linkstate/${authProvider.id}`,
        connected: await this.authService.getAuthProviderState(user.id, authProvider),
      }))),
    };
  }

  /* istanbul ignore next */
  @Post('linkstate/:id')
  @UseGuards(AuthenticatedGuard)
  async setLinkStates(
    @CurrentUser() user: User, @Param('id') id: string, @Res() res: Response,
    @Body() body: any,
  ): Promise<void> {
    const authProvider = AUTH_PROVIDERS.find((authProvider) => authProvider.id === id);

    if (!authProvider) {
      const ro: BasicResponseObject = {
        error: {
          message: 'Auth provider not found',
        },
      };
      res.status(404).send(ro);
      return;
    }

    const inputs = (authProvider as AuthProviderForm).inputs;

    if (!inputs.every((input) => input.formId in body)) {
      const ro: BasicResponseObject = {
        error: {
          message: 'Bad Request',
        },
      };
      res.status(400).send(ro);
      return;
    }

    await Promise.all(inputs.map(async (input) =>
      this.cacheService.storeUserToken(user.id, `${authProvider.id}-${input.tokenName}`, body[input.formId])
    ));

    res.status(204).send();
  }

  /* istanbul ignore next */
  @Get('azuread')
  forwardAzureAd(@Req() req: Request, @Res() res: Response): void {
    this.authService.prepareLogIn(req);
    passport.authenticate('azuread')(req, res);
  }

  /* istanbul ignore next */
  @Get('azuread/callback')
  @UseGuards(AuthGuard('azuread'))
  async callbackAzureAd(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.authService.logInSession(req, res);
  }

  /* istanbul ignore next */
  @Get('github')
  forwardGitHub(@Req() req: Request, @Res() res: Response): void {
    this.authService.prepareLogIn(req);
    passport.authenticate('github')(req, res);
  }

  /* istanbul ignore next */
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async callbackGitHub(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.authService.logInSession(req, res);
  }

  /* istanbul ignore next */
  @Get('facebook')
  forwardFacebook(@Req() req: Request, @Res() res: Response): void {
    this.authService.prepareLogIn(req);
    passport.authenticate('facebook')(req, res);
  }

  /* istanbul ignore next */
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async callbackFacebook(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.authService.logInSession(req, res);
  }

  /* istanbul ignore next */
  @Get('google')
  forwardGoogle(@Req() req: Request, @Res() res: Response): void {
    this.authService.prepareLogIn(req);
    passport.authenticate('google')(req, res);
  }

  /* istanbul ignore next */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async callbackGoogle(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.authService.logInSession(req, res);
  }

  /* istanbul ignore next */
  @Get('twitter')
  forwardTwitter(@Req() req: Request, @Res() res: Response): void {
    this.authService.prepareLogIn(req);
    passport.authenticate('twitter')(req, res);
  }

  /* istanbul ignore next */
  @Get('twitter/callback')
  @UseGuards(AuthGuard('twitter'))
  async callbackTwitter(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.authService.logInSession(req, res);
  }

  /* istanbul ignore next */
  @Get('slack')
  forwardSlack(@Req() req: Request, @Res() res: Response): void {
    this.authService.prepareLogIn(req);
    passport.authenticate('slack')(req, res);
  }

  /* istanbul ignore next */
  @Get('slack/callback')
  @UseGuards(AuthGuard('slack'))
  async callbackSlack(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.authService.logInSession(req, res);
  }

  /* istanbul ignore next */
  @Get('discord')
  forwardDiscord(@Req() req: Request, @Res() res: Response): void {
    this.authService.prepareLogIn(req);
    passport.authenticate('discord')(req, res);
  }

  /* istanbul ignore next */
  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async callbackDiscord(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.authService.logInSession(req, res);
  }
}
