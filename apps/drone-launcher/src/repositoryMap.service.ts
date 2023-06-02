import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { IConfig } from './config/configuration';

@Injectable()
export class RepositoryMapService {
  constructor(private configService: ConfigService<IConfig>) {}

  getRepositoryByAppName(appName: string): string {
    const appConfig = this.configService.get<string>('appConfigMap')[appName];

    if (!appConfig) {
      throw new Error(`App ${appName} not found`);
    }

    return appConfig.repository;
  }
}
