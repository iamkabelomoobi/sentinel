import { Inject, Injectable } from '@nestjs/common';
import { LOGGER_TRANSPORT } from './logger.provider';
import type { LoggerContext, LoggerTransport } from './logger.provider';

@Injectable()
export class LoggerService {
  constructor(
    @Inject(LOGGER_TRANSPORT)
    private readonly logger: LoggerTransport,
  ) {}

  async info(message: string, context?: LoggerContext) {
    await this.logger.info(message, context);
  }

  async error(message: string, error?: unknown, context?: LoggerContext) {
    await this.logger.error(message, {
      ...context,
      error,
    });
  }

  async warn(message: string, context?: LoggerContext) {
    await this.logger.warn(message, context);
  }

  async debug(message: string, context?: LoggerContext) {
    await this.logger.debug(message, context);
  }
}
