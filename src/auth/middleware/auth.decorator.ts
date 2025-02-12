import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

export function Auth() {
  return applyDecorators(
    UseGuards(AuthGuard)
  );
}
