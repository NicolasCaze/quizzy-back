import { UserDetails } from '../model';

export const AuthRepository = Symbol('AuthRepository');
export interface AuthRepository {
  getUserFromToken(token: string): Promise<UserDetails>;

  getUserByUid(uid: string): Promise<UserDetails>;
}
