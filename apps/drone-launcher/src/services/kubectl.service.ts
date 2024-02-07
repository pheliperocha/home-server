import { ConfigService } from '@nestjs/config';
import { IConfig } from '../config/configuration';
import { Injectable } from '@nestjs/common';
import { promisify } from 'util';
import { exec } from 'child_process';

interface PodDescription {
  apiVersion?: string;
  items?: {
    apiVersion?: string;
    kind?: string;
    metadata?: any;
    spec?: any;
    status?: {
      conditions?: any[];
      containerStatuses?: {
        containerID?: string;
        image?: string;
        imageID?: string;
        lastState?: any;
        name?: string;
        ready?: boolean;
        restartCount?: number;
        started?: boolean;
        state?: {
          waiting?: {
            message?: string;
            reason?: 'ImagePullBackOff' | 'ErrImagePull' | 'CrashLoopBackOff';
          };
          running?: {
            startedAt?: string;
          };
          terminated?: {
            containerID?: string;
            exitCode?: number;
            finishedAt?: string;
            message?: string;
            reason?: string;
            startedAt?: string;
          };
        };
        hostIP?: string;
        phase?: string;
        podIP?: string;
        podIPs?: any[];
        qosClass?: string;
        startTime?: string;
      }[];
    };
  }[];
}

@Injectable()
export class KubectlService {
  constructor(private configService: ConfigService<IConfig>) {}

  async checkRelease(
    namespace: string,
    appVersion: string,
    pid: string,
  ): Promise<void> {
    const command = `kubectl get pod -n ${namespace} -l app.kubernetes.io/version=${appVersion} -o=json`;
    const timeout = 1 * 60 * 1000; // 5 minutes
    const startTime = Date.now();

    const asyncExec = promisify(exec);

    console.log('Waiting for release to be ready...');

    while (true) {
      const { stdout } = await asyncExec(command, {
        cwd: `${this.configService.get('tempFolder')}/${pid}/kube`,
      });

      const podDescription = JSON.parse(stdout) as PodDescription;

      if (this.isPodReady(podDescription)) {
        console.log('New release is ready');
        return;
      }

      const { hasError, message } = this.isPodInErrorState(podDescription);
      if (hasError) {
        throw new Error(`Error in the release: ${message}`);
      }

      if (Date.now() - startTime >= timeout) {
        console.error('Timeout reached while waiting for release');
        throw new Error('Release check timed out');
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  private isPodReady(podDescription: PodDescription): boolean {
    return podDescription?.items?.[0]?.status?.containerStatuses?.[0]?.ready;
  }

  private isPodInErrorState(podDescription: PodDescription): {
    hasError: boolean;
    message?: string;
  } {
    const terminatedState =
      podDescription?.items?.[0]?.status?.containerStatuses?.[0]?.state
        ?.terminated;

    if (terminatedState) {
      return {
        hasError: terminatedState.exitCode !== 0,
        message: terminatedState?.message,
      };
    }

    const waitingState =
      podDescription?.items?.[0]?.status?.containerStatuses?.[0]?.state
        ?.waiting;

    if (
      ['ImagePullBackOff', 'ErrImagePull', 'CrashLoopBackOff'].includes(
        waitingState?.reason,
      )
    ) {
      return {
        hasError: true,
        message: waitingState?.message,
      };
    }

    return {
      hasError: false,
    };
  }
}
