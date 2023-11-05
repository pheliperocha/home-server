import { IsEnum, IsString } from 'class-validator';

export enum TargetType {
  staging = 'staging',
  production = 'production',
}

export class EnqueuLaunchProcessDto {
  @IsString()
  appName: string;

  @IsString()
  commitId: string;

  @IsEnum(TargetType)
  target: TargetType;
}

export class GetStatusByProcessIdDto {
  @IsString()
  processId: string;
}

export const isValidTargetType = (target: string): target is TargetType => {
  return Object.values(TargetType).includes(target as TargetType);
};
