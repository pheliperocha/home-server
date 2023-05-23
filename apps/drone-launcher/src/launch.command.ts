import { TargetType } from './launch.dto';

export class LaunchCommand {
  constructor(
    public readonly processId: string,
    public readonly appName: string,
    public readonly commitId: string,
    public readonly target: TargetType,
  ) {}
}
