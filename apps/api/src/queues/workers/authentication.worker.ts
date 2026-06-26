import { Job } from 'bull';

import { applicationLogger } from '../../common/logger/application-logger';
import { notificationUtil } from '../../notification/notification.util';
import { authenticationQueue } from '../authentication.queue';
import { EmailJob } from '../email.job';

authenticationQueue.process(async (job: Job<EmailJob>) => {
  const { email, subject, html, meta } = job.data;

  await applicationLogger.info('Processing authentication email job', {
    jobId: job.id,
    email,
    subject,
    meta,
  });

  if (!email) {
    throw new Error('Email address is required');
  }

  if (!subject) {
    throw new Error('Email subject is required');
  }

  if (!html || html.trim().length === 0) {
    throw new Error('Email HTML content is required');
  }

  await notificationUtil.sendEmail(email, subject, html);

  await applicationLogger.info('Authentication email sent successfully', {
    jobId: job.id,
    email,
    subject,
    meta,
  });
});

authenticationQueue.on('completed', (job) => {
  void applicationLogger.info('Authentication email job completed', {
    jobId: job.id,
    email: job.data.email,
    subject: job.data.subject,
    meta: job.data.meta,
  });
});

authenticationQueue.on('failed', (job, error) => {
  void applicationLogger.error('Authentication email job failed', error, {
    jobId: job?.id,
    email: job?.data.email,
    subject: job?.data.subject,
    meta: job?.data.meta,
  });
});
