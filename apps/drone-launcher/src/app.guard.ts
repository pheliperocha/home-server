import { Injectable, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfig } from './config/configuration';

@Injectable()
export class AppGuard {
  constructor(private configService: ConfigService<IConfig>) {}

  public canActivate(context: ExecutionContext): boolean {
    const { body } = context.switchToHttp().getRequest();

    const isAppAllowed =
      this.configService.get<string>('appConfigMap')[body.appName];

    if (isAppAllowed) {
      return true;
    }

    return false;
  }
}
