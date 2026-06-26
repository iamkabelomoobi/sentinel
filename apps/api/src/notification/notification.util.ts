import { Resend } from 'resend';

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
      throw new Error(error.message);
    }

    console.log(`Email sent to ${receiver} with subject "${subject}"`, {
      provider: 'resend',
      id: data?.id,
    });
  }

  private async sendWithLocalMail(
    receiver: string,
    subject: string,
    html: string,
  ) {
    await notificationLib.createNodemailerTransport().sendMail({
      from: this.getFromAddress(),
      to: receiver,
      subject,
      html,
    });

    console.log(`Email sent to ${receiver} with subject "${subject}"`, {
      provider: 'local',
      inbox: process.env.MAILPIT_WEB_URL,
    });
  }

  public async sendEmail(receiver: string, subject: string, html: string) {
    if (process.env.NODE_ENV === 'production') {
      await this.sendWithResend(receiver, subject, html);
      return;
    }

    await this.sendWithLocalMail(receiver, subject, html);
  }
}

export const notificationUtil = NotificationUtil.getInstance();
