import { Injectable, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfig } from './config/configuration';

@Injectable()
export class AppGuard {
  constructor(private configService: ConfigService<IConfig>) {}

  public canActivate(context: ExecutionContext): boolean {
    const { body } = context.switchToHttp().getRequest();

    const isAppAllowed =
      this.configService.get<string>('appConfigMap')[body?.data?.app_name];

    if (!isAppAllowed) {
      console.error(`Invalid app name: ${body?.data?.app_name}`);
      return false;
    }

    return true;
  }
}
