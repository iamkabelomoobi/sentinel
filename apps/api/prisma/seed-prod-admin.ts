import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { hashPassword } from '@better-auth/utils/password';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { Pool } from 'pg';

const envPath = resolve(
  process.cwd(),
  process.env.PROD_ENV_FILE || '.env.production',
);

if (existsSync(envPath)) {
  config({ path: envPath });
} else {
  config();
}

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
  OrganizationType,
  PrismaClient,
  UserRole,
  UserStatus,
} = require('../generated/prisma/client');

const databaseUrl = process.env.DATABASE_URL;

function requireEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`${name} is not set. Run with ${name}="<password>".`);
  }

  return value;
}

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const adminPassword = requireEnv(
  'PROD_ADMIN_PASSWORD',
  process.env.PROD_ADMIN_PASSWORD || process.env.SEED_PROD_ADMIN_PASSWORD,
);

const pool = new Pool({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const admin = {
  name: 'Kabelo Moobi',
  email: 'giftmoobi@gmail.com',
  role: UserRole.SUPER_ADMIN,
};

async function main() {
  const passwordHash = await hashPassword(adminPassword);

  const organization = await prisma.organization.upsert({
    where: { slug: 'sentinel-security' },
    update: {
      name: 'Sentinel Security',
      type: OrganizationType.SECURITY_COMPANY,
      email: 'security@sentinel.local',
      isActive: true,
    },
    create: {
      name: 'Sentinel Security',
      slug: 'sentinel-security',
      type: OrganizationType.SECURITY_COMPANY,
      email: 'security@sentinel.local',
      isActive: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: admin.email },
    update: {
      name: admin.name,
      role: admin.role,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      organizationId: organization.id,
    },
    create: {
      id: randomUUID(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      organizationId: organization.id,
    },
  });

  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: 'credential',
        accountId: admin.email,
      },
    },
    update: {
      userId: user.id,
      password: passwordHash,
    },
    create: {
      id: randomUUID(),
      accountId: admin.email,
      providerId: 'credential',
      userId: user.id,
      password: passwordHash,
    },
  });

  console.log('Production admin seeded');
  console.log(`Email: ${admin.email}`);
  console.log(`Name: ${admin.name}`);
  console.log(`Role: ${admin.role}`);
  console.log('Password source: PROD_ADMIN_PASSWORD');
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
