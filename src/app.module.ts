import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PingController } from './controller/ping/ping.controller';
import { PingService } from './service/ping/ping.service';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import * as admin from 'firebase-admin'
import * as dotenv from 'dotenv';


dotenv.config();
@Module({
  imports: [AuthModule],
  controllers: [AppController, PingController],
  providers: [AppService, PingService],
})
export class AppModule {
  public configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(AuthMiddleware)
        .forRoutes({ path: "*", method: RequestMethod.ALL });
  
      admin.initializeApp({
        credential: admin.credential.cert({
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          project_id: process.env.FIREBASE_PROJECT_ID,
        } as Partial<admin.ServiceAccount>),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    }
}
