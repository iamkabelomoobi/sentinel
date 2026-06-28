import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('../database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../database/prisma.service';
import { RegistrationService } from './registration.service';

const prismaMock = {
  organization: {
    create: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
  },
};

const authServiceMock = {
  api: {
    signUpEmail: jest.fn(),
  },
};

describe('RegistrationService', () => {
  let service: RegistrationService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: 'AUTH_SERVICE',
          useValue: authServiceMock,
        },
      ],
    }).compile();

    service = module.get(RegistrationService);
  });

  it('creates an organization and signs up its org admin', async () => {
    prismaMock.organization.findUnique.mockResolvedValue(null);
    prismaMock.organization.create.mockResolvedValue({
      id: 'org-1',
      name: 'Acme Security',
      slug: 'acme-security',
      type: 'SECURITY_COMPANY',
      email: 'ops@acme.test',
    });
    authServiceMock.api.signUpEmail.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'admin@acme.test',
        name: 'Admin User',
      },
    });

    await service.registerOrganizationAdmin({
      organizationName: 'Acme Security',
      organizationEmail: 'ops@acme.test',
      organizationPhone: '+27 10 555 0101',
      organizationWebsite: 'https://acme.test',
      adminName: 'Admin User',
      adminEmail: 'admin@acme.test',
      adminPassword: 'Password1',
    });

    expect(prismaMock.organization.create).toHaveBeenCalledWith({
      data: {
        name: 'Acme Security',
        slug: 'acme-security',
        type: 'SECURITY_COMPANY',
        email: 'ops@acme.test',
        phone: '+27 10 555 0101',
        website: 'https://acme.test',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        email: true,
      },
    });
    expect(authServiceMock.api.signUpEmail).toHaveBeenCalledWith({
      body: {
        name: 'Admin User',
        email: 'admin@acme.test',
        password: 'Password1',
        role: 'ORG_ADMIN',
        organizationId: 'org-1',
      },
    });
  });

  it('rejects duplicate organization names', async () => {
    prismaMock.organization.findUnique.mockResolvedValue({ id: 'org-1' });

    await expect(
      service.registerOrganizationAdmin({
        organizationName: 'Acme Security',
        organizationEmail: 'ops@acme.test',
        organizationPhone: '',
        organizationWebsite: '',
        adminName: 'Admin User',
        adminEmail: 'admin@acme.test',
        adminPassword: 'Password1',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(authServiceMock.api.signUpEmail).not.toHaveBeenCalled();
  });
});
