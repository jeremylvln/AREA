import { config } from 'dotenv';

import 'reflect-metadata';
import 'isomorphic-fetch';

import passport = require('passport');
import { NestFactory } from '@nestjs/core';
import session from 'express-session';
import { ErrorFilter } from './common/error_filter';
import { LoggingInterceptor } from './common/interceptors/logger.interceptor';
import { AppModule } from './app.module';

config();

const { FRONT_HOST } = process.env;
const defaultPort = 8080;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: FRONT_HOST,
    credentials: true,
  });
  app.useGlobalFilters(new ErrorFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(process.env.PORT || defaultPort);
}

bootstrap();
