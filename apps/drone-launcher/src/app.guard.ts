import { Injectable, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAppConfigMap, IConfig } from './config/configuration';

@Injectable()
export class AppGuard {
  constructor(private configService: ConfigService<IConfig>) {}

  public canActivate(context: ExecutionContext): boolean {
    const { body } = context.switchToHttp().getRequest();

    const isAppAllowed = this.configService.get<IAppConfigMap | null>(
      'appConfigMap',
    )[body?.data?.app_name];

    if (!isAppAllowed) {
      console.error(`Invalid app name: ${body?.data?.app_name}`);
      return false;
    }

    const isSenderAllowed = isAppAllowed.allowedUsers.some(
      (user) => user.id === body.sender.id && user.login === body.sender.login,
    );
    if (!isSenderAllowed) {
      console.error(`Invalid sender: ${JSON.stringify(body.sender)}`);
      return false;
    }

    return true;
  }
}
