import { Module, MiddlewareConsumer, RequestMethod, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PingController } from './ping/ping.controller';
import { PingService } from './ping/ping.service';
import { UsersController } from './firebase/users.controller';
import { FirebaseService } from './firebase/firebase.service';
import { QuizzController } from './quizz/quizz.controller';
import { QuizzService } from './quizz/quizz.service';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import * as admin from 'firebase-admin'
import * as dotenv from 'dotenv';



dotenv.config();
admin.initializeApp({
  credential: admin.credential.cert({
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    project_id: process.env.FIREBASE_PROJECT_ID,
  } as Partial<admin.ServiceAccount>),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

@Module({
  imports: [AuthModule],
  controllers: [AppController, PingController, UsersController, QuizzController],
  providers: [AppService, PingService, FirebaseService, QuizzService],
})
export class AppModule implements NestModule{
  public configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(AuthMiddleware)
        .forRoutes({ path: "*", method: RequestMethod.ALL });

    }
}
