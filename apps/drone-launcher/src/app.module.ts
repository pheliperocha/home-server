import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LaunchHandler } from './launch.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConnectionService } from './infra/databaseConnection.service';
import { LaunchProcessLog } from './launchProcess.entity';
import { LaunchProcessLogRepository } from './repository/launchProcessLogRepository';
import { ConfigModule } from '@nestjs/config';
import { RepositoryAllowedService } from './repositoryAllowedService.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConnectionService,
    }),
    TypeOrmModule.forFeature([LaunchProcessLog]),
    CqrsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LaunchHandler,
    LaunchProcessLogRepository,
    RepositoryAllowedService,
  ],
})
export class AppModule {}
