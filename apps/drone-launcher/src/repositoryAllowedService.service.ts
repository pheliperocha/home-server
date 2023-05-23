import { ConfigService } from '@nestjs/config';
import { IConfig } from './config/config.interface';
import { Injectable } from '@nestjs/common';

export type RepositoryAllowed = Array<{
  appName: string;
  repository: string;
}>;

@Injectable()
export class RepositoryAllowedService {
  constructor(private configService: ConfigService<IConfig>) {}

  get(): RepositoryAllowed {
    const repositoriesAllowedString = this.configService.get(
      'REPOSITORIES_ALLOWED',
    );
    const repositoriesAllowedArray = repositoriesAllowedString.split(',');

    return repositoriesAllowedArray.map((appRepoString: string) => {
      const obj = appRepoString.split(':');

      return {
        appName: obj[0],
        repository: obj[1],
      };
    });
  }

  getRepositoryByAppName(appName: string): string {
    const repositoriesAllowed = this.get();

    const repository = repositoriesAllowed.find(
      (obj) => obj.appName === appName,
    );

    if (!repository) {
      throw new Error('Repository not found');
    }

    return repository.repository;
  }
}
