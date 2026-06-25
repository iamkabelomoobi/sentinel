import 'dotenv/config';

import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from '@better-auth/utils/password';
import { Pool } from 'pg';

const Module = require('node:module');
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveGeneratedPrismaTypescript(
  request: string,
  parent: { filename?: string } | undefined,
  isMain: boolean,
  options: unknown,
) {
  if (
    request.endsWith('.js') &&
    parent?.filename?.includes('/generated/prisma/')
  ) {
    const typescriptRequest = resolve(
      dirname(parent.filename),
      request.replace(/\.js$/, '.ts'),
    );

    if (existsSync(typescriptRequest)) {
      return typescriptRequest;
    }
  }

  return originalResolveFilename.call(Module, request, parent, isMain, options);
};

const {
  AvailabilityStatus,
  OrganizationType,
  PrismaClient,
  UserRole,
  UserStatus,
} = require('../generated/prisma/client');

type UserRoleValue = (typeof UserRole)[keyof typeof UserRole];

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const credentialProviderId = 'credential';
const defaultPassword = 'Password123!';
const seedPassword = process.env.SEED_DEFAULT_PASSWORD || defaultPassword;
const passwordSource = process.env.SEED_DEFAULT_PASSWORD
  ? 'SEED_DEFAULT_PASSWORD'
  : 'development fallback';

const organizations = {
  security: {
    name: 'Sentinel Security',
    slug: 'sentinel-security',
    type: OrganizationType.SECURITY_COMPANY,
    email: 'security@sentinel.local',
  },
  controlRoom: {
    name: 'Sentinel Control Room',
    slug: 'sentinel-control-room',
    type: OrganizationType.CONTROL_ROOM,
    email: 'control.room@sentinel.local',
  },
  client: {
    name: 'Sentinel Client',
    slug: 'sentinel-client',
    type: OrganizationType.CLIENT_COMPANY,
    email: 'client.company@sentinel.local',
  },
} as const;

const seededUsers = [
  {
    name: 'Super Admin',
    email: 'super.admin@sentinel.local',
    role: UserRole.SUPER_ADMIN,
    organization: organizations.security.slug,
  },
  {
    name: 'Organization Admin',
    email: 'org.admin@sentinel.local',
    role: UserRole.ORG_ADMIN,
    organization: organizations.security.slug,
  },
  {
    name: 'Control Room Operator',
    email: 'control.room@sentinel.local',
    role: UserRole.CONTROL_ROOM,
    organization: organizations.controlRoom.slug,
  },
  {
    name: 'Manager',
    email: 'manager@sentinel.local',
    role: UserRole.MANAGER,
    organization: organizations.security.slug,
  },
  {
    name: 'Responder',
    email: 'responder@sentinel.local',
    role: UserRole.RESPONDER,
    organization: organizations.security.slug,
  },
  {
    name: 'Guard',
    email: 'guard@sentinel.local',
    role: UserRole.GUARD,
    organization: organizations.security.slug,
  },
  {
    name: 'Client',
    email: 'client@sentinel.local',
    role: UserRole.CLIENT,
    organization: organizations.client.slug,
  },
] as const;

async function upsertOrganizations() {
  const result = new Map<string, string>();

  for (const organization of Object.values(organizations)) {
    const record = await prisma.organization.upsert({
      where: { slug: organization.slug },
      update: {
        name: organization.name,
        type: organization.type,
        email: organization.email,
        isActive: true,
      },
      create: {
        name: organization.name,
        slug: organization.slug,
        type: organization.type,
        email: organization.email,
        isActive: true,
      },
    });

    result.set(record.slug, record.id);
  }

  return result;
}

async function upsertRoleProfile(userId: string, role: UserRoleValue) {
  if (role === UserRole.CONTROL_ROOM) {
    await prisma.controlRoom.upsert({
      where: { userId },
      update: {
        stationName: 'Sentinel Control Room',
        extension: '100',
      },
      create: {
        userId,
        stationName: 'Sentinel Control Room',
        extension: '100',
      },
    });
  }

  if (role === UserRole.RESPONDER) {
    await prisma.responder.upsert({
      where: { userId },
      update: {
        callSign: 'RESP-001',
        licenseNumber: 'RESP-LIC-001',
        availabilityStatus: AvailabilityStatus.AVAILABLE,
      },
      create: {
        userId,
        callSign: 'RESP-001',
        licenseNumber: 'RESP-LIC-001',
        availabilityStatus: AvailabilityStatus.AVAILABLE,
      },
    });
  }

  if (role === UserRole.GUARD) {
    await prisma.guard.upsert({
      where: { userId },
      update: {
        employeeNumber: 'GUARD-001',
        assignedShift: 'Day',
        availabilityStatus: AvailabilityStatus.AVAILABLE,
      },
      create: {
        userId,
        employeeNumber: 'GUARD-001',
        assignedShift: 'Day',
        availabilityStatus: AvailabilityStatus.AVAILABLE,
      },
    });
  }

  if (role === UserRole.CLIENT) {
    await prisma.client.upsert({
      where: { userId },
      update: {
        emergencyContactName: 'Sentinel Support',
        emergencyContactPhone: '+27000000000',
        preferredContactMethod: 'phone',
      },
      create: {
        userId,
        emergencyContactName: 'Sentinel Support',
        emergencyContactPhone: '+27000000000',
        preferredContactMethod: 'phone',
      },
    });
  }
}

async function main() {
  const passwordHash = await hashPassword(seedPassword);
  const organizationIds = await upsertOrganizations();
  const seededEmails: string[] = [];

  for (const seedUser of seededUsers) {
    const organizationId = organizationIds.get(seedUser.organization);

    if (!organizationId) {
      throw new Error(`Missing organization for ${seedUser.organization}`);
    }

    const user = await prisma.user.upsert({
      where: { email: seedUser.email },
      update: {
        name: seedUser.name,
        role: seedUser.role,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        organizationId,
      },
      create: {
        id: randomUUID(),
        name: seedUser.name,
        email: seedUser.email,
        role: seedUser.role,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        organizationId,
      },
    });

    await upsertRoleProfile(user.id, seedUser.role);

    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: credentialProviderId,
          accountId: seedUser.email,
        },
      },
      update: {
        userId: user.id,
        password: passwordHash,
      },
      create: {
        id: randomUUID(),
        accountId: seedUser.email,
        providerId: credentialProviderId,
        userId: user.id,
        password: passwordHash,
      },
    });

    seededEmails.push(seedUser.email);
  }

  const resetResult = await prisma.account.updateMany({
    where: {
      providerId: credentialProviderId,
    },
    data: {
      password: passwordHash,
    },
  });

  console.log('Seeded organizations:', Object.keys(organizations).length);
  console.log('Seeded users:', seededEmails.length);
  console.log('Credential accounts reset:', resetResult.count);
  console.log('Password source:', passwordSource);
  console.log('Seeded user emails:');
  for (const email of seededEmails) {
    console.log(`- ${email}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
