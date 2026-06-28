import './env';
import './queues/workers/authentication.worker';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use('/api/profile', json({ limit: '2mb' }));
  app.use('/api/registration', json());

  const allowedOrigins = Array.from(
    new Set(
      [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        ...(process.env.CORS_ORIGINS || '').split(','),
      ]
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = Number(process.env.PORT ?? 4000);

  await app.listen(port);

  const url = await app.getUrl();

  Logger.log(`🚀 API running at ${url}`, 'Bootstrap');
}

bootstrap();
