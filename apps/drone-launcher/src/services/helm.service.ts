import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { IConfig } from '../config/configuration';
import { promisify } from 'util';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HelmService {
  constructor(private configService: ConfigService<IConfig>) {}

  async release(
    appName: string,
    namespace: string,
    target: string,
    pid: string,
  ): Promise<void> {
    const releaseName = `${appName}-${target}`;
    const command = `helm secrets upgrade --install -n ${namespace} ${releaseName} . --values values.yaml --values secrets.yaml --values values.${target}.yaml --values secrets.${target}.yaml`;

    const asyncExec = promisify(exec);
    await asyncExec(command, {
      cwd: `${this.configService.get('tempFolder')}/${pid}/kube`,
    });
  }
}
