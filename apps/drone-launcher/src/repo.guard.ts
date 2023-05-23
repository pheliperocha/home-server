import { Injectable, ExecutionContext } from '@nestjs/common';
import { RepositoryAllowedService } from './repositoryAllowedService.service';

@Injectable()
export class RepoGuard {
  constructor(private repositoryAllowedService: RepositoryAllowedService) {}

  public canActivate(context: ExecutionContext): boolean {
    const { body } = context.switchToHttp().getRequest();

    const repositoriesAllowed = this.repositoryAllowedService.get();

    if (repositoriesAllowed.find((obj) => obj.appName === body.appName)) {
      return true;
    }

    return false;
  }
}
