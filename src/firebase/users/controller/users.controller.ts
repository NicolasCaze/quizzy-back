import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FirebaseService } from '../../firebase.service';

@Controller('users')
export class UsersController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post()
  async addUser(@Body() body: { name: string; email: string; password: string }) {
    return this.firebaseService.addUser(body);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.firebaseService.getUser(id);
  }
}
