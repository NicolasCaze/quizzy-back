import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PingController } from './ping/ping.controller';
import { PingService } from './ping/ping.service';
import { UsersController } from './firebase/users.controller';
import { FirebaseService } from './firebase/firebase.service';

@Module({
  imports: [],
  controllers: [AppController, PingController, UsersController],
  providers: [AppService, PingService, FirebaseService],
})
export class AppModule {}
