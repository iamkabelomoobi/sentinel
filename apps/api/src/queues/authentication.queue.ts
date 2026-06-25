import Queue from 'bull';

import { EmailJob } from './email.job';

function getRedisOptions() {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    return redisUrl;
  }

  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
  };
}

const authenticationQueue = new Queue<EmailJob>('authenticationQueue', {
  redis: getRedisOptions(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

function handleQueueError(error: Error) {
  console.error('Authentication queue error:', {
    error: error.message,
    stack: error.stack,
  });
}

authenticationQueue.on('error', handleQueueError);

authenticationQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed`, {
    jobId: job.id,
    error: error.message,
    data: job.data,
  });
});

authenticationQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`, {
    jobId: job.id,
    email: job.data.email,
    subject: job.data.subject,
    meta: job.data.meta,
  });
});

export { authenticationQueue };
