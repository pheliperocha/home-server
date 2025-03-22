import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth.guard';
import {
  EnqueuLaunchProcessDto,
  GetStatusByProcessIdDto,
  isValidTargetType,
} from './launch.dto';
import { AppGuard } from './app.guard';
import { GithubHookBody } from './githubHookBody.type';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/status/:processId')
  @UseGuards(AuthGuard)
  async getStatus(
    @Param() { processId }: GetStatusByProcessIdDto,
  ): Promise<string> {
    console.log(`Get Status ${processId}`);
    return this.appService.getStatus(processId);
  }

  @Post('/hook')
  @UseGuards(AuthGuard, AppGuard)
  async test(@Body() body: GithubHookBody): Promise<string> {
    if (!body?.data?.app_name || !body?.data?.target || !body?.after) {
      console.error('Missing required data', { body: JSON.stringify(body) });
      return;
    }

    if (!isValidTargetType(body.data.target)) {
      console.log(`Invalid target type: ${body.data.target}`);
      return;
    }

    const enqueuLaunchProcessDto: EnqueuLaunchProcessDto = {
      appName: body.data.app_name,
      target: body.data.target,
      commitId: body.data?.commitId || body?.after || body.head_commit.id,
    };

    return this.appService.enqueuLaunchProcess(enqueuLaunchProcessDto);
  }
}
