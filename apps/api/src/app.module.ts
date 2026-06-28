import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './common/logger/logger.module';
import { ProfileModule } from './profile/profile.module';
import { RegistrationModule } from './registration/registration.module';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    LoggerModule,
    ProfileModule,
    RegistrationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
