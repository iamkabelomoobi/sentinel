import 'dotenv/config';

import { dash, sentinel } from '@better-auth/infra';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';

import {
  OrganizationType,
  PrismaClient,
  UserRole,
  UserStatus,
} from '../../generated/prisma/client';
import { adapter } from '../database/prisma.service';
import { authenticationQueue } from '../queues';
import { authenticationTemplate } from './authentication.template';

const prisma = new PrismaClient({ adapter });
const authBaseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:4000';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const authCookieDomain =
  process.env.AUTH_COOKIE_DOMAIN ||
  (process.env.NODE_ENV === 'production'
    ? '.sentinel.bbbsoftware.co.za'
    : undefined);
const trustedOrigins = Array.from(
  new Set(
    [authBaseUrl, frontendUrl, ...(process.env.CORS_ORIGINS || '').split(',')]
      .map((origin) => origin.trim())
      .filter(Boolean),
  ),
);

async function getDefaultOrganizationId() {
  const organization = await prisma.organization.upsert({
    where: { slug: 'sentinel-client' },
    update: {
      name: 'Sentinel Client',
      type: OrganizationType.CLIENT_COMPANY,
      isActive: true,
    },
    create: {
      name: 'Sentinel Client',
      slug: 'sentinel-client',
      type: OrganizationType.CLIENT_COMPANY,
      email: 'client.company@sentinel.local',
      isActive: true,
    },
  });

  return organization.id;
}

async function createRoleProfile(userId: string, role: string) {
  if (role === UserRole.CLIENT) {
    await prisma.client.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }
}

async function queueAuthEmail({
  email,
  subject,
  html,
  meta,
}: {
  email: string;
  subject: string;
  html: string;
  meta?: Record<string, unknown>;
}) {
  await authenticationQueue.add(
    {
      email,
      subject,
      html,
      meta,
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  );
}

export const auth = betterAuth({
  appName: process.env.APP_NAME || 'Sentinel',
  baseURL: authBaseUrl,
  basePath: '/api/auth',
  trustedOrigins,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    additionalFields: {
      phone: {
        type: 'string',
        required: false,
        input: true,
      },
      role: {
        type: 'string',
        required: false,
        input: true,
        defaultValue: UserRole.CLIENT,
      },
      status: {
        type: 'string',
        required: false,
        input: true,
        defaultValue: UserStatus.INVITED,
      },
      organizationId: {
        type: 'string',
        required: false,
        input: true,
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        const verificationUrl = new URL(url);
        const callbackUrl = new URL('/sign-in', frontendUrl).toString();

        verificationUrl.searchParams.set('callbackURL', callbackUrl);

        await queueAuthEmail({
          email: user.email,
          subject: `Verify your ${process.env.APP_NAME || 'Sentinel'} account`,
          html: authenticationTemplate.emailVerification(
            verificationUrl.toString(),
            user.name || user.email,
          ),
          meta: { type: 'email_verification' },
        });
      } catch (error) {
        console.error('Failed to send email verification', { error });
      }
    },
    afterEmailVerification: async (user) => {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: UserStatus.ACTIVE },
      });

      try {
        await queueAuthEmail({
          email: user.email,
          subject: `Welcome to ${process.env.APP_NAME || 'Sentinel'}`,
          html: authenticationTemplate.welcome(user.name || user.email),
          meta: { type: 'welcome' },
        });
      } catch (error) {
        console.error('Failed to send welcome email', { error });
      }
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url, token }) => {
      try {
        await queueAuthEmail({
          email: user.email,
          subject: 'Password reset request',
          html: authenticationTemplate.passwordReset(
            url,
            user.name || user.email,
          ),
          meta: { type: 'password_reset' },
        });
      } catch (error) {
        console.error('Error sending reset password email', { error, token });
      }
    },
    onPasswordReset: async ({ user }) => {
      try {
        await queueAuthEmail({
          email: user.email,
          subject: 'Your password was changed',
          html: authenticationTemplate.passwordUpdateNotice(
            user.name || user.email,
          ),
          meta: { type: 'password_update' },
        });
      } catch (error) {
        console.error('Error sending password update email', { error });
      }
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const role =
            user.role && Object.values(UserRole).includes(user.role as UserRole)
              ? (user.role as UserRole)
              : UserRole.CLIENT;

          return {
            data: {
              ...user,
              role,
              status: UserStatus.INVITED,
              organizationId:
                (user.organizationId as string | undefined) ||
                (await getDefaultOrganizationId()),
            },
          };
        },
        after: async (user) => {
          await createRoleProfile(
            user.id,
            String(user.role || UserRole.CLIENT),
          );
        },
      },
      update: {
        after: async (user) => {
          if (user.emailVerified && user.status === UserStatus.INVITED) {
            await prisma.user.update({
              where: { id: user.id },
              data: { status: UserStatus.ACTIVE },
            });
          }
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    ...(authCookieDomain
      ? {
          crossSubDomainCookies: {
            enabled: true,
            domain: authCookieDomain,
          },
        }
      : {}),
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
    },
  },
  rateLimit: {
    enabled: process.env.NODE_ENV === 'production',
    window: 60,
    max: 100,
  },
  plugins: [
    dash({
      apiKey: process.env.BETTER_AUTH_API_KEY,
    }),
    nextCookies(),
    sentinel({
      apiKey: process.env.BETTER_AUTH_API_KEY,
      security: {
        suspiciousIpBlocking: true,
        compromisedPassword: {
          enabled: true,
          action: 'block',
          minBreachCount: 1,
        },
        geoBlocking: {
          allowList: ['ZA'],
        },
      },
    }),
  ],
});
