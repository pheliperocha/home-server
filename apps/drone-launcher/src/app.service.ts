import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LaunchCommand } from './launch.command';
import { EnqueuLaunchProcessDto } from './launch.dto';
import { v4 as uuid4 } from 'uuid';
import { LaunchProcessLogRepository } from './repository/launchProcessLogRepository';

@Injectable()
export class AppService {
  constructor(
    private commandBus: CommandBus,
    private launchProcessLogRepository: LaunchProcessLogRepository,
  ) {}

  getHello(): string {
    return 'Drone Launcher Service v2.1.2'; // TODO: Auto generate version
  }

  enqueuLaunchProcess({
    appName,
    commitId,
    target,
  }: EnqueuLaunchProcessDto): string {
    const processId = uuid4();

    this.commandBus.execute(
      new LaunchCommand(processId, appName, commitId, target),
    );

    return processId;
  }

  async getStatus(processId: string): Promise<string | null> {
    const result = await this.launchProcessLogRepository.getOldest(processId);
    if (!result) return;

    if (!['Done!', 'Error!'].includes(result.log)) {
      await this.launchProcessLogRepository.markAsFetched(result.id);
    }

    return result.log;
  }
}
