import { Injectable, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfig } from './config/config.interface';

@Injectable()
export class AuthGuard {
  constructor(private configService: ConfigService<IConfig>) {}

  public canActivate(context: ExecutionContext): boolean {
    const { headers } = context.switchToHttp().getRequest();

    if (
      !headers.authorization ||
      headers.authorization !== `Bearer ${this.configService.get('TOKEN')}`
    ) {
      return false;
    }

    return true;
  }
}
