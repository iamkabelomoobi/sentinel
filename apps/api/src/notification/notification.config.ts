const appName = process.env.APP_NAME || 'Sentinel';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

function numberEnv(name: string, fallback: number) {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function booleanEnv(name: string, fallback: boolean) {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  return value === 'true';
}

export const notificationConfig = {
  mailgen: {
    theme: process.env.MAILGEN_PRODUCT_THEME || 'salted',
    product: {
      name: process.env.MAILGEN_PRODUCT_NAME || appName,
      link: process.env.MAILGEN_PRODUCT_LINK || frontendUrl,
      logo: process.env.MAILGEN_PRODUCT_LOGO || undefined,
      copyright:
        process.env.MAILGEN_PRODUCT_COPYRIGHT ||
        `Copyright © ${new Date().getFullYear()} ${appName}. All rights reserved.`,
    },
  },
  nodemailer: {
    service: process.env.NODEMAILER_SERVICE || undefined,
    host:
      process.env.NODEMAILER_HOST ||
      process.env.MAILPIT_HOST ||
      process.env.MAILDEV_HOST ||
      process.env.SMTP_HOST ||
      'localhost',
    port: numberEnv(
      'NODEMAILER_PORT',
      numberEnv(
        'MAILPIT_SMTP_PORT',
        numberEnv('MAILDEV_PORT', numberEnv('SMTP_PORT', 1025)),
      ),
    ),
    secure: booleanEnv(
      'NODEMAILER_SECURE',
      process.env.NODE_ENV === 'production',
    ),
    auth: {
      user: process.env.NODEMAILER_USERNAME || process.env.SMTP_USER || '',
      pass: process.env.NODEMAILER_PASSWORD || process.env.SMTP_PASSWORD || '',
    },
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.RESEND_FROM_EMAIL || '',
  },
};
