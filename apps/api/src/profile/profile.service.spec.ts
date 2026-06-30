import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('../database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

jest.mock('../common/logger/application-logger', () => ({
  applicationLogger: {
    info: jest.fn().mockResolvedValue(undefined),
    error: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@sentinel/schemas/profile', () => ({
  profileUpdateSchema: {
    safeParse(input: unknown) {
      if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return {
          success: false,
          error: { issues: [{ message: 'Invalid profile details' }] },
        };
      }

      const value = input as {
        name?: unknown;
        phone?: unknown;
        image?: unknown;
        organizationId?: unknown;
      };
      const data: Record<string, unknown> = {};

      if ('name' in value) {
        if (typeof value.name !== 'string') {
          return {
            success: false,
            error: { issues: [{ message: 'Name is required.' }] },
          };
        }

        const name = value.name.trim();

        if (name.length < 2) {
          return {
            success: false,
            error: { issues: [{ message: 'Name is required.' }] },
          };
        }

        data.name = name;
      }

      if ('phone' in value) {
        data.phone =
          typeof value.phone === 'string' ? value.phone.trim() : value.phone;
      }

      if ('image' in value) {
        if (
          value.image !== null &&
          (typeof value.image !== 'string' ||
            !/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(
              value.image.trim(),
            ))
        ) {
          return {
            success: false,
            error: {
              issues: [
                {
                  message:
                    'Profile image must be a PNG, JPG, WebP, or GIF under 1MB.',
                },
              ],
            },
          };
        }

        data.image =
          typeof value.image === 'string' ? value.image.trim() : value.image;
      }

      if ('organizationId' in value) {
        if (
          typeof value.organizationId !== 'string' ||
          !value.organizationId.trim()
        ) {
          return {
            success: false,
            error: { issues: [{ message: 'Organization is required.' }] },
          };
        }

        data.organizationId = value.organizationId.trim();
      }

      if (Object.keys(data).length === 0) {
        return {
          success: false,
          error: { issues: [{ message: 'No profile changes provided.' }] },
        };
      }

      return { success: true, data };
    },
  },
}));

import { applicationLogger } from '../common/logger/application-logger';
import { PrismaService } from '../database/prisma.service';
import { ProfileService } from './profile.service';

const prismaMock = {
  organization: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get(ProfileService);
  });

  it('returns the current user profile with active organizations', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Super Admin',
      email: 'super.admin@sentinel.local',
      phone: '+27 10 555 0199',
      image: null,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      organizationId: 'org-1',
      organization: {
        id: 'org-1',
        name: 'Sentinel Platform',
        slug: 'sentinel-platform',
        type: 'SECURITY_COMPANY',
      },
    });
    prismaMock.organization.findMany.mockResolvedValue([
      {
        id: 'org-1',
        name: 'Sentinel Platform',
        slug: 'sentinel-platform',
        type: 'SECURITY_COMPANY',
      },
    ]);

    await expect(service.getMe('user-1')).resolves.toEqual({
      user: {
        id: 'user-1',
        name: 'Super Admin',
        email: 'super.admin@sentinel.local',
        phone: '+27 10 555 0199',
        image: null,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        organizationId: 'org-1',
        organization: {
          id: 'org-1',
          name: 'Sentinel Platform',
          slug: 'sentinel-platform',
          type: 'SECURITY_COMPANY',
        },
      },
      organizations: [
        {
          id: 'org-1',
          name: 'Sentinel Platform',
          slug: 'sentinel-platform',
          type: 'SECURITY_COMPANY',
        },
      ],
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: expect.any(Object),
    });
  });

  it('updates editable profile fields for the current user', async () => {
    prismaMock.organization.findFirst.mockResolvedValue({ id: 'org-2' });
    prismaMock.user.update.mockResolvedValue({
      id: 'user-1',
      name: 'Kabelo Admin',
      email: 'super.admin@sentinel.local',
      phone: '+27 11 222 3333',
      image: null,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      organizationId: 'org-2',
      organization: {
        id: 'org-2',
        name: 'North Region Operations',
        slug: 'north-region',
        type: 'SECURITY_COMPANY',
      },
    });
    prismaMock.organization.findMany.mockResolvedValue([]);

    await service.updateMe('user-1', {
      name: ' Kabelo Admin ',
      phone: ' +27 11 222 3333 ',
      organizationId: 'org-2',
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        name: 'Kabelo Admin',
        phone: '+27 11 222 3333',
        organizationId: 'org-2',
      },
      select: expect.any(Object),
    });
    expect(applicationLogger.info).toHaveBeenCalledWith(
      'Profile update requested',
      {
        userId: 'user-1',
        changedFields: ['name', 'phone', 'organizationId'],
        organizationId: 'org-2',
      },
    );
    expect(applicationLogger.info).toHaveBeenCalledWith(
      'Profile updated successfully',
      {
        userId: 'user-1',
        changedFields: ['name', 'phone', 'organizationId'],
        organizationId: 'org-2',
      },
    );
  });

  it('updates a valid uploaded profile image data url', async () => {
    prismaMock.user.update.mockResolvedValue({
      id: 'user-1',
      name: 'Kabelo Admin',
      email: 'super.admin@sentinel.local',
      phone: null,
      image: 'data:image/png;base64,aGVsbG8=',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      organizationId: 'org-1',
      organization: {
        id: 'org-1',
        name: 'Sentinel Platform',
        slug: 'sentinel-platform',
        type: 'SECURITY_COMPANY',
      },
    });
    prismaMock.organization.findMany.mockResolvedValue([]);

    await service.updateMe('user-1', {
      image: ' data:image/png;base64,aGVsbG8= ',
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        image: 'data:image/png;base64,aGVsbG8=',
      },
      select: expect.any(Object),
    });
  });

  it('rejects non-image profile uploads', async () => {
    await expect(
      service.updateMe('user-1', { image: 'data:text/html;base64,PGgxPg==' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('rejects a blank name update', async () => {
    await expect(
      service.updateMe('user-1', { name: '   ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('rejects an inactive or missing organization', async () => {
    prismaMock.organization.findFirst.mockResolvedValue(null);

    await expect(
      service.updateMe('user-1', { organizationId: 'missing-org' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('throws not found when the current user cannot be loaded', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.getMe('missing-user')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
