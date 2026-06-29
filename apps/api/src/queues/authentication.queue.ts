import Queue from 'bull';

import { applicationLogger } from '../common/logger/application-logger';
import { EmailJob } from './email.job';
import { buildRedisOptions } from './redis-options';

const authenticationQueue = new Queue<EmailJob>('authenticationQueue', {
  redis: buildRedisOptions(process.env),
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
  void applicationLogger.error('Authentication queue error', error);
}

authenticationQueue.on('error', handleQueueError);

authenticationQueue.on('failed', (job, error) => {
  void applicationLogger.error('Authentication queue job failed', error, {
    jobId: job.id,
    data: job.data,
  });
});

authenticationQueue.on('completed', (job) => {
  void applicationLogger.info('Authentication queue job completed', {
    jobId: job.id,
    email: job.data.email,
    subject: job.data.subject,
    meta: job.data.meta,
  });
});

export { authenticationQueue };
