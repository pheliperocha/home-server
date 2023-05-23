import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LaunchProcessLog } from '../launchProcess.entity';

export class LaunchProcessLogRepository {
  constructor(
    @InjectRepository(LaunchProcessLog)
    private launchProcessLogRepository: Repository<LaunchProcessLog>,
  ) {}

  async save(processId: string, log: string): Promise<void> {
    console.log(log);

    await this.launchProcessLogRepository.save({
      processId,
      log,
      fetched: false,
      createdAt: new Date(),
    });

    return;
  }

  async getOldest(processId: string): Promise<LaunchProcessLog> {
    const result = await this.launchProcessLogRepository.find({
      processId,
      fetched: false,
    });

    return result[0];
  }

  async markAsFetched(id: string): Promise<void> {
    await this.launchProcessLogRepository.update(
      {
        id,
      },
      {
        fetched: true,
      },
    );

    return;
  }
}
