import { Body, Controller, Post } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

import { RegistrationService } from './registration.service';

@Controller('api/registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @AllowAnonymous()
  @Post('organization-admin')
  registerOrganizationAdmin(@Body() body: unknown) {
    return this.registrationService.registerOrganizationAdmin(body ?? {});
  }
}
