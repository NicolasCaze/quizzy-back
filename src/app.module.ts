import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PingController } from './ping/controller/ping.controller';
import { PingService } from './ping/service/ping.service';
import { UsersController } from './users/controller/users.controller';
import { UserService } from './users/service/user.service';
import { QuizzController } from './quizz/controller/quizz.controller';
import { QuizzService } from './quizz/service/quizz.service';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import * as dotenv from 'dotenv';
import { QuizzRepository } from './quizz/repository/quizz.repository';
import { FirebaseModule } from 'nestjs-firebase';

dotenv.config();

@Module({
  imports: [AuthModule,
    FirebaseModule.forRoot({
      googleApplicationCredential:
        './src/assets/quizzy-firebase-key.json',
    }),
  ],
  controllers: [AppController, PingController, UsersController, QuizzController],
  providers: [AppService, PingService, UserService, QuizzService, QuizzRepository],
})
export class AppModule {
  public configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(AuthMiddleware)
        .forRoutes({ path: "*", method: RequestMethod.ALL });
    }
}
