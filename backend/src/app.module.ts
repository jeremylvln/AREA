import { join } from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ModulesModule } from './modules/modules.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { AppController } from './app.controller';
import { CacheModule } from './cache/cache.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: String(process.env.DATABASE_HOST),
      port: Number(process.env.DATABASE_PORT),
      username: String(process.env.DATABASE_USERNAME),
      password: String(process.env.DATABASE_PASSWORD),
      database: String(process.env.DATABASE_NAME),
      entities: [
        join(__dirname, './**/*.entity{.ts,.js}'),
        join(__dirname, './**/*.action{.ts,.js}'),
        join(__dirname, './**/*.reaction{.ts,.js}'),
      ],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    ModulesModule,
    WorkflowsModule,
    CacheModule,
    SchedulerModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
