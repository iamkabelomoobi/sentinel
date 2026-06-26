import { Logtail } from '@logtail/node';

export const LOGGER_TRANSPORT = 'LOGGER_TRANSPORT';

export type LoggerContext = Record<string, unknown>;

export interface LoggerTransport {
  info(message: string, context?: LoggerContext): Promise<void>;
  error(message: string, context?: LoggerContext): Promise<void>;
  warn(message: string, context?: LoggerContext): Promise<void>;
  debug(message: string, context?: LoggerContext): Promise<void>;
}

class ConsoleLoggerTransport implements LoggerTransport {
  async info(message: string, context?: LoggerContext) {
    console.info(message, context ?? {});
  }

  async error(message: string, context?: LoggerContext) {
    console.error(message, context ?? {});
  }

  async warn(message: string, context?: LoggerContext) {
    console.warn(message, context ?? {});
  }

  async debug(message: string, context?: LoggerContext) {
    console.debug(message, context ?? {});
  }
}

class LogtailLoggerTransport implements LoggerTransport {
  private readonly logtail: Logtail;

  constructor(sourceToken: string, endpoint?: string) {
    this.logtail = new Logtail(sourceToken, { endpoint });
  }

  async info(message: string, context?: LoggerContext) {
    await this.logtail.info(message, context);
  }

  async error(message: string, context?: LoggerContext) {
    await this.logtail.error(message, context);
  }

  async warn(message: string, context?: LoggerContext) {
    await this.logtail.warn(message, context);
  }

  async debug(message: string, context?: LoggerContext) {
    await this.logtail.debug(message, context);
  }
}

export function createLoggerTransport(): LoggerTransport {
  if (process.env.NODE_ENV !== 'production') {
    return new ConsoleLoggerTransport();
  }

  if (!process.env.LOGTAIL_SOURCE_TOKEN) {
    throw new Error('LOGTAIL_SOURCE_TOKEN is required in production');
  }

  return new LogtailLoggerTransport(
    process.env.LOGTAIL_SOURCE_TOKEN,
    process.env.LOGTAIL_ENDPOINT,
  );
}

export const LoggerTransportProvider = {
  provide: LOGGER_TRANSPORT,
  useFactory: createLoggerTransport,
};
