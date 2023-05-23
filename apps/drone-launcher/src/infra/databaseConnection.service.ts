import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { LaunchProcessLog } from 'src/launchProcess.entity';

@Injectable()
export class DatabaseConnectionService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [LaunchProcessLog],
      synchronize: true,
      logging: false,
    };
  }
}
