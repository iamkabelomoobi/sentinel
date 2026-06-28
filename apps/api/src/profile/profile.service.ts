import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  profileUpdateSchema,
  type ProfileUpdateInput,
} from '@sentinel/schemas/profile';

import { PrismaService } from '../database/prisma.service';

const organizationSelect = {
  id: true,
  name: true,
  slug: true,
  type: true,
};

const userProfileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  image: true,
  role: true,
  status: true,
  organizationId: true,
  organization: {
    select: organizationSelect,
  },
};

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userProfileSelect,
    });

    if (!user) {
      throw new NotFoundException('Profile not found');
    }

    const organizations = await this.listOrganizations();

    return { user, organizations };
  }

  async updateMe(userId: string, input: unknown) {
    const parsed = profileUpdateSchema.safeParse(input);

    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues[0]?.message ?? 'Invalid profile details',
      );
    }

    const profileInput: ProfileUpdateInput = parsed.data;
    const data: {
      name?: string;
      phone?: string | null;
      image?: string | null;
      organizationId?: string;
    } = {};

    if (profileInput.name !== undefined) {
      data.name = profileInput.name;
    }

    if (profileInput.phone !== undefined) {
      data.phone = profileInput.phone || null;
    }

    if (profileInput.image !== undefined) {
      data.image = profileInput.image || null;
    }

    if (profileInput.organizationId !== undefined) {
      const organization = await this.prisma.organization.findFirst({
        where: { id: profileInput.organizationId, isActive: true },
        select: { id: true },
      });

      if (!organization) {
        throw new BadRequestException('Organization is not available');
      }

      data.organizationId = profileInput.organizationId;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No profile changes provided');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: userProfileSelect,
    });
    const organizations = await this.listOrganizations();

    return { user, organizations };
  }

  private listOrganizations() {
    return this.prisma.organization.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: organizationSelect,
    });
  }
}
