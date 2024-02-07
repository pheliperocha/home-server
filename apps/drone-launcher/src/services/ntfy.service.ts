import { ConfigService } from '@nestjs/config';
import { IConfig } from '../config/configuration';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

type NtfyResponse = {
  id: string;
  time: number;
  expires: number;
  event: string;
  topic: string;
  message: string;
};

type NtfyOptions = {
  title?: string;
  tags?: string[];
  priority?: 'urgent' | 'high' | 'low' | 'min';
  useMarkdown?: boolean;
};

@Injectable()
export class NtfyService {
  private baseUrl = 'https://ntfy.pheliperocha.com';
  private topic = 'home-server';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService<IConfig>,
  ) {}

  async sendNotification(
    message: string,
    options?: NtfyOptions,
  ): Promise<NtfyResponse> {
    const token = this.configService.get<string>('ntfyToken');

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (options?.title) {
      headers['Title'] = options.title;
    } else {
      headers['Title'] = 'Drone Launcher';
    }

    if (options?.tags) {
      headers['Tags'] = options.tags.join(',');
    }

    if (options?.priority) {
      headers['Priority'] = options.priority;
    }

    if (options?.useMarkdown) {
      headers['Markdown'] = 'yes';
    }

    const observableResponse = this.httpService.post<NtfyResponse>(
      `${this.baseUrl}/${this.topic}`,
      message,
      {
        headers,
      },
    );

    const result = await firstValueFrom(observableResponse);
    return result.data;
  }
}
