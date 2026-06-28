import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

import { auth } from '../auth/auth';
import { ProfileService } from './profile.service';

@Controller('api/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  getMe(@Session() session: UserSession<typeof auth>) {
    return this.profileService.getMe(session.user.id);
  }

  @Patch('me')
  updateMe(
    @Session() session: UserSession<typeof auth>,
    @Body() body: Record<string, unknown>,
  ) {
    return this.profileService.updateMe(session.user.id, body ?? {});
  }
}
