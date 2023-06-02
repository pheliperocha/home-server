import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth.guard';
import { EnqueuLaunchProcessDto, GetStatusByProcessIdDto } from './launch.dto';
import { AppGuard } from './app.guard';

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

  @Post('/launch')
  @UseGuards(AuthGuard, AppGuard)
  async enqueuLaunchProcess(
    @Body() enqueuLaunchProcessDto: EnqueuLaunchProcessDto,
  ): Promise<string> {
    console.log(
      `Launching ${enqueuLaunchProcessDto.appName} to ${enqueuLaunchProcessDto.target}`,
    );

    // TODO: Use queue instead like Bull with Redis
    const processId = this.appService.enqueuLaunchProcess(
      enqueuLaunchProcessDto,
    );

    return processId;
  }
}
