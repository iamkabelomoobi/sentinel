import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { signUpSchema, type SignUpInput } from '@sentinel/schemas/auth';

import { PrismaService } from '../database/prisma.service';
import { OrganizationType, UserRole } from '../../generated/prisma/browser';

type AuthSignUpService = {
  api: {
    signUpEmail(input: {
      body: {
        name: string;
        email: string;
        password: string;
        role: 'ORG_ADMIN';
        organizationId: string;
        callbackURL?: string;
      };
    }): Promise<unknown>;
  };
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class RegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('AUTH_SERVICE') private readonly authService: AuthSignUpService,
  ) {}

  async registerOrganizationAdmin(input: unknown) {
    const parsed = signUpSchema.safeParse(input);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0]?.message);
    }

    const data: SignUpInput = parsed.data;
    const slug = slugify(data.organizationName);
    const existingOrganization = await this.prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingOrganization) {
      throw new ConflictException('Organization already exists.');
    }

    const organization = await this.prisma.organization.create({
      data: {
        name: data.organizationName,
        slug,
        type: OrganizationType.SECURITY_COMPANY,
        email: data.organizationEmail,
        phone: data.organizationPhone || null,
        website: data.organizationWebsite || null,
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

    try {
      const authResult = await this.authService.api.signUpEmail({
        body: {
          name: data.adminName,
          email: data.adminEmail,
          password: data.adminPassword,
          role: UserRole.ORG_ADMIN,
          organizationId: organization.id,
        },
      });

      return {
        organization,
        auth: authResult,
      };
    } catch (error) {
      await this.prisma.organization.delete({
        where: { id: organization.id },
      });
      throw error;
    }
  }
}
