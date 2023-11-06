import { Injectable, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfig } from './config/configuration';
import * as crypto from 'crypto';

@Injectable()
export class AuthGuard {
  constructor(private configService: ConfigService<IConfig>) {}

  public canActivate(context: ExecutionContext): boolean {
    const { headers, rawBody, body } = context
      .switchToHttp()
      .getRequest<Request & { rawBody: any }>();

    if (!this.verifyBearerToken(headers['authorization'])) {
      console.error('Invalid bearer token', { body: JSON.stringify(body) });
      return false;
    }

    const signature = headers['x-hub-signature-256'];
    if (!this.verifySignature(rawBody, signature)) {
      console.error('Invalid signature', {
        body: JSON.stringify(body),
        signature,
      });
      return false;
    }

    return true;
  }

  private verifySignature = (body: any, incomingSignature: string) => {
    const webhookSecret = this.configService.get('webhookSecret');

    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    const trusted = Buffer.from(`sha256=${signature}`, 'ascii');
    const untrusted = Buffer.from(incomingSignature, 'ascii');

    return crypto.timingSafeEqual(trusted, untrusted);
  };

  private verifyBearerToken = (incomingToken: string) => {
    const token = this.configService.get('token');
    return incomingToken === `Bearer ${token}`;
  };
}
