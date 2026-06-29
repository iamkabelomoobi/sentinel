import { RedisOptions } from 'ioredis';

interface RedisEnvironment {
  REDIS_HOST?: string;
  REDIS_PASSWORD?: string;
  REDIS_PORT?: string;
  REDIS_URL?: string;
}

function parseRedisUrl(redisUrl: string): RedisOptions {
  const url = new URL(redisUrl);
  const isTls = url.protocol === 'rediss:';
  const db = url.pathname.replace('/', '');

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 6379,
    username: url.username ? decodeURIComponent(url.username) : undefined,
    password: url.password ? decodeURIComponent(url.password) : undefined,
    db: db ? Number(db) : undefined,
    tls: isTls ? {} : undefined,
    connectTimeout: 10000,
    enableReadyCheck: false,
    keepAlive: 30000,
    maxRetriesPerRequest: null,
    retryStrategy: (attempts) => Math.min(attempts * 200, 2000),
  };
}

export function buildRedisOptions(env: RedisEnvironment): RedisOptions {
  if (env.REDIS_URL) {
    return parseRedisUrl(env.REDIS_URL);
  }

  return {
    host: env.REDIS_HOST || 'localhost',
    port: Number(env.REDIS_PORT || 6379),
    password: env.REDIS_PASSWORD || undefined,
  };
}
