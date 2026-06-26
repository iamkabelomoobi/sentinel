import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { dirname, normalize, resolve, sep } from 'node:path';

import { hashPassword } from '@better-auth/utils/password';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { Pool } from 'pg';

const configuredEnvPath =
  process.env.PROD_SEED_ENV_FILE || process.env.PROD_ENV_FILE;
const envPath = resolve(process.cwd(), configuredEnvPath || '.env');

if (existsSync(envPath)) {
  config({ path: envPath, override: true });
} else if (configuredEnvPath) {
  throw new Error(`Seed env file not found: ${envPath}`);
} else {
  config();
}

const Module = require('node:module');
const originalResolveFilename = Module._resolveFilename;

function isGeneratedPrismaPath(filename?: string): filename is string {
  if (!filename) {
    return false;
  }

  const segments = normalize(filename).split(sep);
  return segments.includes('generated') && segments.includes('prisma');
}

Module._resolveFilename = function resolveGeneratedPrismaTypescript(
  request: string,
  parent: { filename?: string } | undefined,
  isMain: boolean,
  options: unknown,
) {
  const parentFilename = parent?.filename;

  if (request.endsWith('.js') && isGeneratedPrismaPath(parentFilename)) {
    const typescriptRequest = resolve(
      dirname(parentFilename),
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

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

function requireAdminPassword() {
  const envNames = [
    'PROD_SUPER_ADMIN_PASSWORD',
    'PROD_ADMIN_PASSWORD',
    'SEED_PROD_ADMIN_PASSWORD',
    'PROD_SEED_DEFAULT_PASSWORD',
  ];
  const match = envNames.find((name) => process.env[name]);

  if (!match) {
    throw new Error(
      `Missing admin password env. Set one of: ${envNames.join(', ')}`,
    );
  }

  return {
    password: process.env[match]!,
    source: match,
  };
}

const organization = {
  name: requireEnv('PROD_SECURITY_ORG_NAME'),
  slug: requireEnv('PROD_SECURITY_ORG_SLUG'),
  email: requireEnv('PROD_SECURITY_ORG_EMAIL'),
  type: OrganizationType.SECURITY_COMPANY,
};

const admin = {
  name: requireEnv('PROD_SUPER_ADMIN_NAME'),
  email: requireEnv('PROD_SUPER_ADMIN_EMAIL'),
  role: UserRole.SUPER_ADMIN,
};

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: { email: admin.email },
    select: { id: true },
  });

  if (existingUser) {
    console.log('Production admin seed complete');
    console.log('Created organization: 0');
    console.log('Created admin: 0');
    console.log(`Skipped existing admin: ${admin.email}`);
    return;
  }

  const password = requireAdminPassword();
  const passwordHash = await hashPassword(password.password);

  const existingOrganization = await prisma.organization.findUnique({
    where: { slug: organization.slug },
    select: { id: true },
  });

  const organizationRecord =
    existingOrganization ??
    (await prisma.organization.create({
      data: {
        name: organization.name,
        slug: organization.slug,
        type: organization.type,
        email: organization.email,
        isActive: true,
      },
    }));

  const user = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      organizationId: organizationRecord.id,
    },
  });

  await prisma.account.create({
    data: {
      id: randomUUID(),
      accountId: admin.email,
      providerId: 'credential',
      userId: user.id,
      password: passwordHash,
    },
  });

  console.log('Production admin seed complete');
  console.log('Created organization:', existingOrganization ? 0 : 1);
  console.log('Created admin: 1');
  console.log(`Admin email: ${admin.email}`);
  console.log(`Password source: ${password.source}`);
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
