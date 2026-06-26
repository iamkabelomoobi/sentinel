import { LOGGER_TRANSPORT, LoggerTransportProvider } from './logger.provider';

describe('LoggerTransportProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.LOGTAIL_SOURCE_TOKEN;
    delete process.env.LOGTAIL_ENDPOINT;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses console transport outside production', () => {
    process.env.NODE_ENV = 'development';

    const transport = LoggerTransportProvider.useFactory();

    expect(LoggerTransportProvider.provide).toBe(LOGGER_TRANSPORT);
    expect(transport.info).toEqual(expect.any(Function));
    expect(transport.error).toEqual(expect.any(Function));
    expect(transport.warn).toEqual(expect.any(Function));
    expect(transport.debug).toEqual(expect.any(Function));
  });

  it('requires a Logtail source token in production', () => {
    process.env.NODE_ENV = 'production';

    expect(() => LoggerTransportProvider.useFactory()).toThrow(
      'LOGTAIL_SOURCE_TOKEN is required in production',
    );
  });
});
