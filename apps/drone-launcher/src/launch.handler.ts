import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LaunchCommand } from './launch.command';
import { LaunchProcessLogRepository } from './repository/launchProcessLogRepository';
import { ConfigService } from '@nestjs/config';
import { IConfig } from './config/config.interface';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import { TargetType } from './launch.dto';
import { RepositoryAllowedService } from './repositoryAllowedService.service';

@CommandHandler(LaunchCommand)
export class LaunchHandler implements ICommandHandler<LaunchCommand> {
  private readonly folder = '/home/pheliperocha/www/test-clone';

  constructor(
    private launchProcessLogRepository: LaunchProcessLogRepository,
    private configService: ConfigService<IConfig>,
    private repositoryAllowedService: RepositoryAllowedService,
  ) {}

  async execute({
    processId: pid,
    appName,
    commitId,
    target,
  }: LaunchCommand): Promise<void> {
    try {
      await this.launchProcessLogRepository.save(
        pid,
        'Starting launch process',
      );

      const repository =
        this.repositoryAllowedService.getRepositoryByAppName(appName);

      await this.cloneRepository(pid, repository);
      await this.checkoutCommitId(pid, commitId);
      await this.setImageTag(pid, commitId);
      await this.helmRelease(pid, appName, target);

      await this.launchProcessLogRepository.save(pid, 'Done!');

      return;
    } catch (err) {
      console.error(err);
    }
  }

  async cloneRepository(pid: string, repository: string) {
    try {
      await this.launchProcessLogRepository.save(
        pid,
        `Starting application repository ${repository} cloning...`,
      );

      const gitToken = this.configService.get('GIT_TOKEN');
      const url = `https://${gitToken}@github.com/${repository}.git`;

      const asyncExec = promisify(exec);
      await asyncExec(`git clone ${url} ${pid}`, {
        cwd: this.folder,
      });

      await this.launchProcessLogRepository.save(
        pid,
        'Application repository cloning completed successfully.',
      );
    } catch (err) {
      await this.launchProcessLogRepository.save(
        pid,
        'Error occurred during application repository cloning.',
      );

      throw err;
    }
  }

  async checkoutCommitId(pid: string, commitId: string) {
    try {
      await this.launchProcessLogRepository.save(
        pid,
        `Checking out to commit ID ${commitId}...`,
      );

      const asyncExec = promisify(exec);
      await asyncExec(`git checkout ${commitId}`, {
        cwd: `${this.folder}/${pid}`,
      });

      await this.launchProcessLogRepository.save(
        pid,
        `Checkout completed. Currently at commit ID: ${commitId}.`,
      );
    } catch (err) {
      await this.launchProcessLogRepository.save(
        pid,
        'Failed to checkout to the specified commit ID.',
      );

      throw err;
    }
  }

  async setImageTag(pid: string, commitId: string) {
    try {
      await this.launchProcessLogRepository.save(
        pid,
        `Updating image tag to ${commitId}...`,
      );

      const valuesPath = `${this.folder}/${pid}/deploy/values.yaml`;
      const data = fs.readFileSync(valuesPath, 'utf8');
      const newData = data.replace(/\btag: latest\b/gim, `tag: ${commitId}`);
      fs.writeFileSync(valuesPath, newData, 'utf-8');

      await this.launchProcessLogRepository.save(
        pid,
        `Image tag updated successfully.`,
      );
    } catch (err) {
      await this.launchProcessLogRepository.save(
        pid,
        'Failed to update image tag.',
      );

      throw err;
    }
  }

  async helmRelease(pid: string, appName: string, target: TargetType) {
    try {
      await this.launchProcessLogRepository.save(
        pid,
        `Starting helm release the application...`,
      );

      const namespace = `${appName}-${target}`;
      const releaseName = `${appName}-${target}`;
      const command = `helm secrets upgrade --install -n ${namespace} ${releaseName} . --values values.yaml --values secrets.yaml --values values.${target}.yaml --values secrets.${target}.yaml`;
      // TODO: Run helm secrets update

      console.log(command);

      await this.launchProcessLogRepository.save(
        pid,
        `Helm update completed. Application released successfully.`,
      );
    } catch (err) {
      await this.launchProcessLogRepository.save(
        pid,
        'Error occurred during Helm update.',
      );

      throw err;
    }
  }
}
