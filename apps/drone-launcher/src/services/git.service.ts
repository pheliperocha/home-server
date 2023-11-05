import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { IConfig } from '../config/configuration';
import { promisify } from 'util';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GitService {
  constructor(private configService: ConfigService<IConfig>) {}

  async clone(repository: string, pid: string): Promise<void> {
    const tempFolder = this.configService.get('tempFolder');
    const asyncExec = promisify(exec);
    await asyncExec(`git clone ${repository} ${pid}`, {
      cwd: tempFolder,
    });
  }

  async checkout(commitId: string, pid: string): Promise<void> {
    const asyncExec = promisify(exec);
    await asyncExec(`git checkout ${commitId}`, {
      cwd: `${this.configService.get('tempFolder')}/${pid}`,
    });
  }
}
