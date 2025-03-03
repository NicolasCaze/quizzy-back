import { Controller, Post, Body, Request, UseGuards, HttpCode, Param, Get, Req } from '@nestjs/common';
import { FirebaseService } from '../../firebase.service';
import { Auth } from '../../../auth/middleware/auth.decorator';
import { RequestWithUser } from '../../../auth/model';

@Controller('users')
export class UsersController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post()
  @Auth()
  @HttpCode(201)
  async addUser(@Request() req : RequestWithUser, @Body() body: { username: string }) {
    const uid = req.user.uid;
    return this.firebaseService.addUser(uid, body.username);
  }

  @Get('me')
  @Auth()
  async getUser(@Req() req: RequestWithUser) {
    const uid = req.user.uid; 
    return this.firebaseService.getUser(uid);
  }
}

