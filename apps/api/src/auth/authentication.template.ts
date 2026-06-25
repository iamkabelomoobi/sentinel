import { notificationConfig } from '../notification/notification.config';
import { notificationLib } from '../notification/notification.lib';

class AuthenticationTemplate {
  private static instance: AuthenticationTemplate;

  private constructor() {
    //
  }

  public static getInstance() {
    if (!AuthenticationTemplate.instance) {
      AuthenticationTemplate.instance = new AuthenticationTemplate();
    }

    return AuthenticationTemplate.instance;
  }

  public passwordReset(url: string, username: string) {
    return notificationLib.getMailgenInstance().generate({
      body: {
        title: `${notificationConfig.mailgen.product.name} reset your password`,
        intro: `Someone recently requested a password change for your ${notificationConfig.mailgen.product.name} account with username: ${username}`,
        action: {
          instructions:
            'Click on the button below within the next 15 minutes to reset your password',
          button: {
            text: 'Reset Password',
            color: '#2563eb',
            link: url,
          },
        },
        outro: `If you did not request a password reset, please ignore this email. Having trouble? Copy this link into your browser instead: ${url}`,
      },
    });
  }

  public emailVerification(url: string, username: string) {
    return notificationLib.getMailgenInstance().generate({
      body: {
        title: `Verify your email, ${username}.`,
        intro: `Please verify your ${notificationConfig.mailgen.product.name} account email address.`,
        action: {
          instructions: 'Click the button below to verify your email:',
          button: {
            text: 'Verify Email',
            color: '#2563eb',
            link: url,
          },
        },
        outro: `If you did not create this account, please ignore this email. Having trouble? Copy this link into your browser instead: ${url}`,
      },
    });
  }

  public welcome(username: string) {
    return notificationLib.getMailgenInstance().generate({
      body: {
        title: `Welcome, ${username}.`,
        intro: `Your ${notificationConfig.mailgen.product.name} account is ready.`,
      },
    });
  }

  public passwordUpdateNotice(username: string) {
    return notificationLib.getMailgenInstance().generate({
      body: {
        title: `Hi, ${username}.`,
        intro: `Your ${notificationConfig.mailgen.product.name} password has been successfully updated.`,
        outro: `If you did not make this change, please contact support from ${notificationConfig.mailgen.product.link}.`,
      },
    });
  }
}

export const authenticationTemplate = AuthenticationTemplate.getInstance();
