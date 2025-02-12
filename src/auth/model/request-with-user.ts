import { UserDetails } from './user-details';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: UserDetails;
}
