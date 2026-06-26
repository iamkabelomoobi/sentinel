import {
  createLoggerTransport,
  LoggerContext,
  LoggerTransport,
} from './logger.provider';

let loggerTransport: LoggerTransport | null = null;

function getLoggerTransport() {
  if (!loggerTransport) {
    loggerTransport = createLoggerTransport();
  }

  return loggerTransport;
}

export const applicationLogger = {
  async info(message: string, context?: LoggerContext) {
    await getLoggerTransport().info(message, context);
  },

  async error(message: string, error?: unknown, context?: LoggerContext) {
    await getLoggerTransport().error(message, {
      ...context,
      error,
    });
  },

  async warn(message: string, context?: LoggerContext) {
    await getLoggerTransport().warn(message, context);
  },

  async debug(message: string, context?: LoggerContext) {
    await getLoggerTransport().debug(message, context);
  },
};
