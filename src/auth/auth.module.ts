import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './middleware/auth.guard';
import { FirebaseAuthRepository } from './repositories/firebase-auth.repository';
import { AuthRepository } from './repositories/auth.repository';

@Module({
  controllers: [],
  providers: [
    AuthGuard,
    AuthService,
    { provide: AuthRepository, useClass: FirebaseAuthRepository },
  ],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}
