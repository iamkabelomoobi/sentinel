import { buildRedisOptions } from './redis-options';

describe('buildRedisOptions', () => {
  it('configures TLS and resilient retries for rediss Redis URLs', () => {
    const options = buildRedisOptions({
      REDIS_URL: 'rediss://default:secret@example.upstash.io:6379',
    });

    expect(options).toMatchObject({
      host: 'example.upstash.io',
      port: 6379,
      username: 'default',
      password: 'secret',
      tls: {},
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      keepAlive: 30000,
    });
    expect(options.retryStrategy?.(1)).toBe(200);
    expect(options.retryStrategy?.(30)).toBe(2000);
  });

  it('falls back to discrete Redis host settings', () => {
    const options = buildRedisOptions({
      REDIS_HOST: 'redis.internal',
      REDIS_PORT: '6380',
      REDIS_PASSWORD: 'secret',
    });

    expect(options).toMatchObject({
      host: 'redis.internal',
      port: 6380,
      password: 'secret',
    });
  });
});
