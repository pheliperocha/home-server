import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth.guard';
import { EnqueuLaunchProcessDto, GetStatusByProcessIdDto } from './launch.dto';
import { RepoGuard } from './repo.guard';

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
    return this.appService.getStatus(processId);
  }

  @Post('/launch')
  @UseGuards(AuthGuard, RepoGuard)
  async enqueuLaunchProcess(
    @Body() enqueuLaunchProcessDto: EnqueuLaunchProcessDto,
  ): Promise<string> {
    // TODO: Use queue instead like Bull with Redis
    const processId = this.appService.enqueuLaunchProcess(
      enqueuLaunchProcessDto,
    );

    return processId;
  }
}
