import { Resend } from 'resend';

import { applicationLogger } from '../common/logger/application-logger';
import { notificationConfig } from './notification.config';
import { notificationLib } from './notification.lib';

class NotificationUtil {
  private static instance: NotificationUtil;
  private resendClient: Resend | null = null;

  private constructor() {
    //
  }

  public static getInstance() {
    if (!NotificationUtil.instance) {
      NotificationUtil.instance = new NotificationUtil();
    }

    return NotificationUtil.instance;
  }

  private getFromAddress() {
    if (process.env.NODE_ENV === 'production') {
      if (!notificationConfig.resend.fromEmail) {
        throw new Error(
          'Missing required environment variable: RESEND_FROM_EMAIL',
        );
      }

      return notificationConfig.resend.fromEmail;
    }

    const localUser =
      notificationConfig.nodemailer.auth.user || 'no-reply@sentinel.local';

    return `${notificationConfig.mailgen.product.name} <${localUser}>`;
  }

  private getResendClient() {
    if (!notificationConfig.resend.apiKey) {
      throw new Error('Missing required environment variable: RESEND_API_KEY');
    }

    if (!this.resendClient) {
      this.resendClient = new Resend(notificationConfig.resend.apiKey);
    }

    return this.resendClient;
  }

  private async sendWithResend(
    receiver: string,
    subject: string,
    html: string,
  ) {
    const { data, error } = await this.getResendClient().emails.send({
      from: this.getFromAddress(),
      to: [receiver],
      subject,
      html,
    });

    if (error) {
      await applicationLogger.error('Email send failed', error, {
        provider: 'resend',
        receiver,
        subject,
      });
      throw new Error(error.message);
    }

    await applicationLogger.info('Email sent', {
      provider: 'resend',
      receiver,
      subject,
      id: data?.id,
    });
  }

  private async sendWithLocalMail(
    receiver: string,
    subject: string,
    html: string,
  ) {
    try {
      await notificationLib.createNodemailerTransport().sendMail({
        from: this.getFromAddress(),
        to: receiver,
        subject,
        html,
      });

      await applicationLogger.info('Email sent', {
        provider: 'local',
        receiver,
        subject,
        inbox: process.env.MAILPIT_WEB_URL,
      });
    } catch (error) {
      await applicationLogger.error('Email send failed', error, {
        provider: 'local',
        receiver,
        subject,
      });
      throw error;
    }
  }

  public async sendEmail(receiver: string, subject: string, html: string) {
    await applicationLogger.info('Email send requested', {
      provider: process.env.NODE_ENV === 'production' ? 'resend' : 'local',
      receiver,
      subject,
    });

    if (process.env.NODE_ENV === 'production') {
      await this.sendWithResend(receiver, subject, html);
      return;
    }

    await this.sendWithLocalMail(receiver, subject, html);
  }
}

export const notificationUtil = NotificationUtil.getInstance();
