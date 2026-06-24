import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = Number(process.env.PORT ?? 4000);

  await app.listen(port);

  const url = await app.getUrl();

  Logger.log(`🚀 API running at ${url}`, 'Bootstrap');
}

bootstrap();
