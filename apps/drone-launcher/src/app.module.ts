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
import { RepositoryMapService } from './services/repositoryMap.service';
import configuration from './config/configuration';
import { NamespaceMapService } from './services/namespaceMap.service';
import { FileService } from './services/file.service';
import { GitService } from './services/git.service';
import { HelmService } from './services/helm.service';
import { KubectlService } from './services/kubectl.service';
import { NtfyService } from './services/ntfy.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConnectionService,
    }),
    TypeOrmModule.forFeature([LaunchProcessLog]),
    CqrsModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LaunchHandler,
    LaunchProcessLogRepository,
    RepositoryMapService,
    NamespaceMapService,
    FileService,
    GitService,
    HelmService,
    KubectlService,
    NtfyService,
  ],
})
export class AppModule {}
