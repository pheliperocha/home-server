import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { IAppConfigMap, IConfig } from '../config/configuration';

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

  /** Where and under which release name an app is deployed for a target. */
  getDeployTarget(
    appName: string,
    target: string,
  ): { namespace: string; releaseName: string } {
    const appConfig = this.configService.get<IAppConfigMap>('appConfigMap')[
      appName
    ];

    if (!appConfig) {
      throw new Error(`App ${appName} not found`);
    }

    return {
      namespace: appConfig.fixedNamespace
        ? appConfig.namespace
        : `${appConfig.namespace}-${target}`,
      releaseName: appConfig.releaseName ?? `${appName}-${target}`,
    };
  }
}
