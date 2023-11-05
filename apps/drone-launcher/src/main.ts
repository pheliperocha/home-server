import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { validationPipeConfig } from './config/validationPipe.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: true,
  });
  app.useGlobalPipes(new ValidationPipe(validationPipeConfig));

  const PORT = process.env.PORT;
  await app.listen(PORT, () => {
    console.log(`Service listening at ${PORT}`);
  });
}
bootstrap();
