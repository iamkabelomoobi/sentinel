import { Module } from '@nestjs/common';
import { LoggerTransportProvider } from './logger.provider';
import { LoggerService } from './logger.service';

@Module({
  providers: [LoggerTransportProvider, LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
