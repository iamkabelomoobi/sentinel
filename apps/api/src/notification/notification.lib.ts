import Mailgen from 'mailgen';
import nodemailer, { Transporter } from 'nodemailer';

import { notificationConfig } from './notification.config';

class NotificationLib {
  private static instance: NotificationLib;
  private transporter: Transporter | null = null;

  private constructor() {
    //
  }

  public static getInstance() {
    if (!NotificationLib.instance) {
      NotificationLib.instance = new NotificationLib();
    }

    return NotificationLib.instance;
  }

  public getMailgenInstance(theme = notificationConfig.mailgen.theme) {
    return new Mailgen({
      theme,
      product: notificationConfig.mailgen.product,
    });
  }

  public createNodemailerTransport() {
    if (this.transporter) {
      return this.transporter;
    }

    const { service, host, port, secure, auth } = notificationConfig.nodemailer;
    const hasAuth = Boolean(auth.user && auth.pass);

    this.transporter = nodemailer.createTransport({
      ...(service ? { service } : { host, port }),
      secure,
      ...(hasAuth ? { auth } : {}),
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });

    return this.transporter;
  }
}

export const notificationLib = NotificationLib.getInstance();
