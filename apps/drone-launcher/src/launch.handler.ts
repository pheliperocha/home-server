import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LaunchCommand } from './launch.command';
import { LaunchProcessLogRepository } from './repository/launchProcessLogRepository';
import { ConfigService } from '@nestjs/config';
import { TargetType } from './launch.dto';
import { RepositoryMapService } from './services/repositoryMap.service';
import { IConfig } from './config/configuration';
import { NamespaceMapService } from './services/namespaceMap.service';
import { GitService } from './services/git.service';
import { FileService } from './services/file.service';
import { HelmService } from './services/helm.service';

@CommandHandler(LaunchCommand)
export class LaunchHandler implements ICommandHandler<LaunchCommand> {
  constructor(
    private launchProcessLogRepository: LaunchProcessLogRepository,
    private configService: ConfigService<IConfig>,
    private repositoryMap: RepositoryMapService,
    private namespaceMap: NamespaceMapService,
    private gitService: GitService,
    private fileService: FileService,
    private helmService: HelmService,
  ) {}

  public async execute({
    processId: pid,
    appName,
    commitId,
    target,
  }: LaunchCommand): Promise<void> {
    try {
      await this.launchProcessLogRepository.save(
        pid,
        `Starting launch process: ${pid}`,
      );

      const repository = this.repositoryMap.getRepositoryByAppName(appName);

      await this.cloneRepository(pid, repository);
      await this.checkoutCommitId(pid, commitId);
      await this.setImageTag(pid, commitId);
      await this.helmRelease(pid, appName, target);

      await this.launchProcessLogRepository.save(pid, 'Done!');

      return;
    } catch (err) {
      await this.launchProcessLogRepository.save(pid, 'Error!');
      console.error(err);
    }
  }

  private async cloneRepository(pid: string, repository: string) {
    try {
      await this.launchProcessLogRepository.save(
        pid,
        `Starting application repository ${repository} cloning...`,
      );

      const gitToken = this.configService.get('gitToken');
      const url = `https://${gitToken}@github.com/${repository}.git`;

      await this.gitService.clone(url, pid);

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

  private async checkoutCommitId(pid: string, commitId: string) {
    try {
      await this.launchProcessLogRepository.save(
        pid,
        `Checking out to commit ID ${commitId}...`,
      );

      await this.gitService.checkout(commitId, pid);

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

  private async setImageTag(pid: string, commitId: string) {
    try {
      await this.launchProcessLogRepository.save(
        pid,
        `Updating image tag to ${commitId}...`,
      );

      const valuesPath = `${this.configService.get(
        'tempFolder',
      )}/${pid}/kube/values.yaml`;

      await this.fileService.replaceInFile(
        valuesPath,
        /\btag: latest\b/gim,
        `tag: ${commitId}`,
      );

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

  private async helmRelease(pid: string, appName: string, target: TargetType) {
    try {
      await this.launchProcessLogRepository.save(
        pid,
        `Starting helm release the application...`,
      );

      const namespacePrefix = this.namespaceMap.getNamespaceByAppName(appName);
      const namespace = `${namespacePrefix}-${target}`;
      await this.helmService.release(appName, namespace, target, pid);

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
