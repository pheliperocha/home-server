import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { IConfig } from './config/configuration';

export type RepositoryAllowed = Array<{
  appName: string;
  repository: string;
}>;

@Injectable()
export class NamespaceMapService {
  constructor(private configService: ConfigService<IConfig>) {}

  getNamespaceByAppName(appName: string): string {
    const appConfig = this.configService.get<string>('appConfigMap')[appName];

    if (!appConfig) {
      throw new Error(`App ${appName} not found`);
    }

    return appConfig.namespace;
  }
}
