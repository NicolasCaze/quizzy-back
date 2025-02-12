import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDetails } from '../model';
import { AuthRepository } from '../repositories/auth.repository';

interface TokenDetails {
  email: string;
  uid: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(AuthRepository) private readonly repository: AuthRepository
  ) {}

  async getUserByUid(uid: string): Promise<UserDetails> {
    return await this.repository.getUserByUid(uid);
  }

  async authenticate(authToken: string): Promise<TokenDetails> {
    const tokenString = this.getToken(authToken);
    try {
      return this.repository.getUserFromToken(tokenString);
    } catch (err) {
      this.logger.error(`error while authenticate request ${err.message}`);
      throw new UnauthorizedException(err.message);
    }
  }

  private getToken(authToken: string): string {
    const match = authToken.match(/^Bearer (.*)$/);
    if (!match || match.length < 2) {
      throw new UnauthorizedException('Invalid token');
    }
    return match[1];
  }
}
