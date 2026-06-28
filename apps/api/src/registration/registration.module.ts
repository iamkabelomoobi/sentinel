import { Module } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';

import { AuthModule } from '../auth/auth.module';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';

@Module({
  imports: [AuthModule],
  controllers: [RegistrationController],
  providers: [
    RegistrationService,
    {
      provide: 'AUTH_SERVICE',
      useExisting: AuthService,
    },
  ],
})
export class RegistrationModule {}
